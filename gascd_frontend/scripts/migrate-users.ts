import 'dotenv/config';
import { Kysely, MssqlDialect } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';

// Copies user + account rows from one User_DB to another (EH -> DAC).
// Skips session/verification - sessions don't migrate (different BETTER_AUTH_SECRET)
// and verification tokens are short-lived. Idempotent: re-running is safe.
//
// Required env (SOURCE = read, TARGET = write):
//   SOURCE_USER_DB_SERVER, SOURCE_USER_DATABASE, SOURCE_USER_DB_PORT (default 1433)
//   TARGET_USER_DB_SERVER, TARGET_USER_DATABASE, TARGET_USER_DB_PORT (default 1433)
// Auth (per side, one of):
//   <PREFIX>_USER_DB_ACCESS_TOKEN                  (Entra access token, scope https://database.windows.net/.default)
//   <PREFIX>_USER_DB_USERNAME + ..._PASSWORD       (SQL login)
//
// Optional:
//   DRY_RUN=true                  read-only, no writes
//   PROVIDER_FILTER=govuk-one-login  only copy accounts for this provider
//
// Usage:
//   DRY_RUN=true npx tsx scripts/migrate-users.ts
//   npx tsx scripts/migrate-users.ts

const TABLES_IN_ORDER: { name: string; pk: string }[] = [
  { name: 'user', pk: 'id' },
  { name: 'account', pk: 'id' },
];

function buildDialect(prefix: 'SOURCE' | 'TARGET'): MssqlDialect {
  const server = process.env[`${prefix}_USER_DB_SERVER`];
  const database = process.env[`${prefix}_USER_DATABASE`];
  const port = Number(process.env[`${prefix}_USER_DB_PORT`] ?? '1433');
  const token = process.env[`${prefix}_USER_DB_ACCESS_TOKEN`];
  const userName = process.env[`${prefix}_USER_DB_USERNAME`];
  const password = process.env[`${prefix}_USER_DB_PASSWORD`];

  if (!server || !database) {
    throw new Error(
      `${prefix}_USER_DB_SERVER and ${prefix}_USER_DATABASE are required`
    );
  }

  let authentication: Tedious.ConnectionAuthentication;
  if (token) {
    authentication = {
      type: 'azure-active-directory-access-token',
      options: { token },
    };
  } else if (userName && password) {
    authentication = { type: 'default', options: { userName, password } };
  } else {
    throw new Error(
      `Provide either ${prefix}_USER_DB_ACCESS_TOKEN or ${prefix}_USER_DB_USERNAME + ${prefix}_USER_DB_PASSWORD`
    );
  }

  return new MssqlDialect({
    tarn: { ...Tarn, options: { min: 0, max: 5, propagateCreateError: true } },
    tedious: {
      ...Tedious,
      connectionFactory: () =>
        new Tedious.Connection({
          server,
          authentication,
          options: {
            encrypt: true,
            enableArithAbort: true,
            database,
            port,
          },
        }),
    },
  });
}

// Extra uniqueness checks beyond the primary key, to avoid hitting UNIQUE-constraint
// errors mid-migration. Returns a short reason string when the row should be skipped.
async function findCollision(
  tgt: Kysely<any>,
  table: string,
  row: any
): Promise<string | null> {
  if (table === 'user' && row.email) {
    const hit = await tgt
      .selectFrom('user')
      .select('id')
      .where('email', '=', row.email)
      .executeTakeFirst();
    if (hit) return `email already exists in target (target id=${hit.id})`;
  }
  if (table === 'account' && row.providerId && row.accountId) {
    const hit = await tgt
      .selectFrom('account')
      .select('id')
      .where('providerId', '=', row.providerId)
      .where('accountId', '=', row.accountId)
      .executeTakeFirst();
    if (hit) return `providerId+accountId already exists (target id=${hit.id})`;
  }
  return null;
}

async function copyTable(
  src: Kysely<any>,
  tgt: Kysely<any>,
  table: string,
  pk: string,
  dryRun: boolean,
  providerFilter: string | null
) {
  let q = src.selectFrom(table).selectAll();
  if (table === 'account' && providerFilter) {
    q = q.where('providerId', '=', providerFilter);
  }
  const rows = await q.execute();
  console.log(`[${table}] source rows: ${rows.length}`);

  let inserted = 0;
  let skippedByPk = 0;
  let skippedByCollision = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const existing = await tgt
        .selectFrom(table)
        .select(pk as any)
        .where(pk as any, '=', (row as any)[pk])
        .executeTakeFirst();
      if (existing) {
        skippedByPk++;
        continue;
      }
      const collision = await findCollision(tgt, table, row);
      if (collision) {
        console.warn(`[${table}] skip ${pk}=${(row as any)[pk]}: ${collision}`);
        skippedByCollision++;
        continue;
      }
      if (!dryRun) {
        await tgt
          .insertInto(table)
          .values(row as any)
          .execute();
      }
      inserted++;
    } catch (e: any) {
      console.error(
        `[${table}] error on ${pk}=${(row as any)[pk]}: ${e.message}`
      );
      errors++;
    }
  }

  console.log(
    `[${table}] inserted=${inserted} skipped_by_pk=${skippedByPk} skipped_by_collision=${skippedByCollision} errors=${errors}`
  );
  return { inserted, skippedByPk, skippedByCollision, errors };
}

async function main() {
  const dryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  const providerFilter = process.env.PROVIDER_FILTER || null;
  console.log(
    `Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}${providerFilter ? ` | account provider filter: ${providerFilter}` : ''}`
  );
  console.log(
    `Source: ${process.env.SOURCE_USER_DB_SERVER} / ${process.env.SOURCE_USER_DATABASE}`
  );
  console.log(
    `Target: ${process.env.TARGET_USER_DB_SERVER} / ${process.env.TARGET_USER_DATABASE}`
  );

  const src = new Kysely<any>({ dialect: buildDialect('SOURCE') });
  const tgt = new Kysely<any>({ dialect: buildDialect('TARGET') });

  let totalErrors = 0;
  try {
    for (const { name, pk } of TABLES_IN_ORDER) {
      const r = await copyTable(src, tgt, name, pk, dryRun, providerFilter);
      totalErrors += r.errors;
    }
  } finally {
    await src.destroy();
    await tgt.destroy();
  }

  if (totalErrors > 0) {
    console.error(`Completed with ${totalErrors} errors.`);
    process.exit(1);
  }
  console.log(dryRun ? 'Dry run complete.' : 'Migration complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
