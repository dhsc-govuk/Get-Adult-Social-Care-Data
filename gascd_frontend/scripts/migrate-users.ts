import 'dotenv/config';
import { Kysely, MssqlDialect } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';
import * as fs from 'fs';

// Copies user + account rows from one User_DB to another (EH -> DAC).
// Skips session/verification - sessions don't migrate (different BETTER_AUTH_SECRET)
// and verification tokens are short-lived. Idempotent on the target: re-runs are safe.
//
// Three modes:
//   MODE=extract  - read from SOURCE, write a JSON dump to OUTPUT_FILE.   No TARGET needed.
//   MODE=import   - read JSON from INPUT_FILE, write to TARGET.            No SOURCE needed.
//   MODE=migrate  - direct SOURCE -> TARGET (the original mode; default).  Both needed.
//
// Extract + import together let the two halves run on different machines (e.g. a
// cloud runner that can reach EH's public SQL, then a VNet-injected runner that
// can reach DAC's private SQL).
//
// Required env per mode:
//   Common:
//     PROVIDER_FILTER=govuk-one-login    (optional, applies to extract + migrate)
//     DRY_RUN=true                       (optional, applies to import + migrate)
//   extract:
//     SOURCE_USER_DB_SERVER, SOURCE_USER_DATABASE, SOURCE_USER_DB_PORT (default 1433)
//     auth: SOURCE_USER_DB_ACCESS_TOKEN OR SOURCE_USER_DB_USERNAME + SOURCE_USER_DB_PASSWORD
//     OUTPUT_FILE                        (path to write JSON to)
//   import:
//     TARGET_USER_DB_SERVER, TARGET_USER_DATABASE, TARGET_USER_DB_PORT (default 1433)
//     auth: TARGET_USER_DB_ACCESS_TOKEN OR TARGET_USER_DB_USERNAME + TARGET_USER_DB_PASSWORD
//     INPUT_FILE                         (path to read JSON from)
//   migrate:
//     SOURCE_* + TARGET_* + auth on both sides (no files)
//
// Usage:
//   MODE=extract OUTPUT_FILE=./dump.json SOURCE_USER_DB_SERVER=... npx tsx scripts/migrate-users.ts
//   MODE=import  INPUT_FILE=./dump.json TARGET_USER_DB_SERVER=... DRY_RUN=true npx tsx scripts/migrate-users.ts
//   MODE=migrate SOURCE_* TARGET_* DRY_RUN=true npx tsx scripts/migrate-users.ts

const TABLES_IN_ORDER: { name: string; pk: string }[] = [
  { name: 'user', pk: 'id' },
  { name: 'account', pk: 'id' },
];

// Fields on the `user` row that can legitimately change between the initial
// migration and the final DNS cut-over (opt-ins, terms, selected location,
// display name). Refresh mode overwrites these on existing rows so the DAC
// copy stays in sync with EH right up to the switch. Immutable identity /
// membership fields (id, email, role, locationType, locationId) are not
// touched.
const MUTABLE_USER_FIELDS = [
  'name',
  'marketingConsent',
  'marketingConsentDate',
  'termsAccepted',
  'termsAcceptedDate',
  'selectedLocationId',
  'selectedLocationDisplayName',
  'selectedLocationCategory',
  'smartInsights',
];

type TableDump = { name: string; pk: string; rows: any[] };

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

async function extractTable(
  src: Kysely<any>,
  table: string,
  providerFilter: string | null
): Promise<any[]> {
  let q = src.selectFrom(table).selectAll();
  if (table === 'account' && providerFilter) {
    q = q.where('providerId', '=', providerFilter);
  }
  return await q.execute();
}

async function importRows(
  tgt: Kysely<any>,
  table: string,
  pk: string,
  rows: any[],
  dryRun: boolean,
  refresh = false
) {
  console.log(
    `[${table}] rows to process: ${rows.length}${refresh ? ' (refresh mode: existing rows get mutable fields updated)' : ''}`
  );
  let inserted = 0;
  let refreshed = 0;
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
        if (refresh && table === 'user') {
          const patch: Record<string, any> = {};
          for (const f of MUTABLE_USER_FIELDS) {
            if (f in row) patch[f] = (row as any)[f];
          }
          if (Object.keys(patch).length > 0 && !dryRun) {
            await tgt
              .updateTable('user')
              .set(patch)
              .where('id', '=', (row as any).id)
              .execute();
          }
          refreshed++;
        } else {
          skippedByPk++;
        }
        continue;
      }
      const collision = await findCollision(tgt, table, row);
      if (collision) {
        // In refresh mode a same-email different-id user is expected on the
        // second pass (e.g. dedup fix); refresh mutable fields on that target row.
        if (refresh && table === 'user' && row.email) {
          const patch: Record<string, any> = {};
          for (const f of MUTABLE_USER_FIELDS) {
            if (f in row) patch[f] = (row as any)[f];
          }
          if (Object.keys(patch).length > 0 && !dryRun) {
            await tgt
              .updateTable('user')
              .set(patch)
              .where('email', '=', row.email)
              .execute();
          }
          refreshed++;
          continue;
        }
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
    `[${table}] inserted=${inserted} refreshed=${refreshed} skipped_by_pk=${skippedByPk} skipped_by_collision=${skippedByCollision} errors=${errors}`
  );
  return { inserted, refreshed, skippedByPk, skippedByCollision, errors };
}

// JSON (de)serialisation helpers - preserve Date / Buffer across the file handoff.
function replacer(_key: string, value: any) {
  if (value instanceof Date) return { __t: 'date', v: value.toISOString() };
  if (
    value &&
    typeof value === 'object' &&
    value.type === 'Buffer' &&
    Array.isArray(value.data)
  ) {
    return { __t: 'buffer', v: Buffer.from(value.data).toString('base64') };
  }
  return value;
}
function reviver(_key: string, value: any) {
  if (value && typeof value === 'object' && value.__t === 'date')
    return new Date(value.v);
  if (value && typeof value === 'object' && value.__t === 'buffer')
    return Buffer.from(value.v, 'base64');
  return value;
}

async function runExtract() {
  const providerFilter = process.env.PROVIDER_FILTER || null;
  const outputFile = process.env.OUTPUT_FILE;
  if (!outputFile)
    throw new Error('OUTPUT_FILE env var is required in extract mode');

  console.log(
    `Mode: EXTRACT${providerFilter ? ` | account provider filter: ${providerFilter}` : ''}`
  );
  console.log(
    `Source: ${process.env.SOURCE_USER_DB_SERVER} / ${process.env.SOURCE_USER_DATABASE}`
  );
  console.log(`Output: ${outputFile}`);

  const src = new Kysely<any>({ dialect: buildDialect('SOURCE') });
  const dump: {
    exportedAt: string;
    source: { server?: string; database?: string };
    providerFilter: string | null;
    tables: TableDump[];
  } = {
    exportedAt: new Date().toISOString(),
    source: {
      server: process.env.SOURCE_USER_DB_SERVER,
      database: process.env.SOURCE_USER_DATABASE,
    },
    providerFilter,
    tables: [],
  };
  try {
    for (const { name, pk } of TABLES_IN_ORDER) {
      const rows = await extractTable(src, name, providerFilter);
      console.log(`[${name}] extracted ${rows.length} rows`);
      dump.tables.push({ name, pk, rows });
    }
  } finally {
    await src.destroy();
  }
  fs.writeFileSync(outputFile, JSON.stringify(dump, replacer, 2));
  console.log(`Extract complete. Wrote ${outputFile}.`);
}

async function runImport() {
  const dryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  const refresh = (process.env.REFRESH || '').toLowerCase() === 'true';
  const inputFile = process.env.INPUT_FILE;
  if (!inputFile)
    throw new Error('INPUT_FILE env var is required in import mode');

  console.log(
    `Mode: IMPORT (${dryRun ? 'DRY RUN' : 'LIVE'}${refresh ? ' | REFRESH: existing users get mutable fields updated' : ''})`
  );
  console.log(`Input: ${inputFile}`);
  console.log(
    `Target: ${process.env.TARGET_USER_DB_SERVER} / ${process.env.TARGET_USER_DATABASE}`
  );

  const dump = JSON.parse(fs.readFileSync(inputFile, 'utf-8'), reviver);
  if (!dump || !Array.isArray(dump.tables))
    throw new Error('Input file format unexpected (missing .tables array)');
  console.log(
    `Loaded export from ${dump.source?.server} / ${dump.source?.database} (exportedAt=${dump.exportedAt})`
  );

  const tgt = new Kysely<any>({ dialect: buildDialect('TARGET') });
  let totalErrors = 0;
  try {
    for (const t of dump.tables as TableDump[]) {
      const r = await importRows(tgt, t.name, t.pk, t.rows, dryRun, refresh);
      totalErrors += r.errors;
    }
  } finally {
    await tgt.destroy();
  }

  if (totalErrors > 0) {
    console.error(`Completed with ${totalErrors} errors.`);
    process.exit(1);
  }
  console.log(dryRun ? 'Dry run import complete.' : 'Import complete.');
}

async function runDirectMigrate() {
  const dryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  const refresh = (process.env.REFRESH || '').toLowerCase() === 'true';
  const providerFilter = process.env.PROVIDER_FILTER || null;
  console.log(
    `Mode: MIGRATE (${dryRun ? 'DRY RUN' : 'LIVE'}${refresh ? ' | REFRESH: existing users get mutable fields updated' : ''})${providerFilter ? ` | account provider filter: ${providerFilter}` : ''}`
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
      const rows = await extractTable(src, name, providerFilter);
      console.log(`[${name}] source rows: ${rows.length}`);
      const r = await importRows(tgt, name, pk, rows, dryRun, refresh);
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

async function main() {
  const mode = (process.env.MODE || 'migrate').toLowerCase();
  switch (mode) {
    case 'extract':
      await runExtract();
      break;
    case 'import':
      await runImport();
      break;
    case 'migrate':
      await runDirectMigrate();
      break;
    default:
      throw new Error(
        `Unknown MODE=${mode} (expected: extract | import | migrate)`
      );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
