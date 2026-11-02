import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';
import { Client } from 'pg';
import { redactUserInfo } from './obfuscate';
import {
  auditRowFor,
  codesToLookUp,
  grantsForRow,
  lookUpCodes,
  unknownCodes,
} from './importUserGrants';

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

const USER_DATABASE_NAME = 'user';

// Usage:
// DRY_RUN=true CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts
// CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts
//
// Each user is saved with their access_grant rows and an access_audit row as well as the
// user columns, ready for the site reading access from access_grant. Codes are checked against gascd_data first, which needs:
//   GASCD_PG_SERVER        - FQDN
//   GASCD_PG_DATABASE      - usually gascd_data
//   GASCD_PG_USER          - the Postgres login (the deploy SP's name)
//   GASCD_PG_ACCESS_TOKEN  - Entra access token for ossrdbms-aad.database.windows.net
//   GASCD_PG_PORT          - optional, default 5432
// IMPORTED_BY names who ran the import in the access history (default "import users").

// Expected CSV headers:
// name,email,location_id,location_type,source
const REQUIRED_FIELDS = [
  'name',
  'email',
  'location_id',
  'location_type',
  'source',
];
const ALLOWED_LOCATION_TYPES = [
  'Care provider',
  'Care provider location',
  'LA',
];

function gascdDataClient() {
  const host = process.env.GASCD_PG_SERVER;
  const database = process.env.GASCD_PG_DATABASE;
  const user = process.env.GASCD_PG_USER;
  const password = process.env.GASCD_PG_ACCESS_TOKEN;
  if (!host || !database || !user || !password) {
    throw new Error(
      'GASCD_PG_SERVER, GASCD_PG_DATABASE, GASCD_PG_USER and GASCD_PG_ACCESS_TOKEN are all required to check codes against gascd_data'
    );
  }
  return new Client({
    host,
    database,
    user,
    password,
    port: Number(process.env.GASCD_PG_PORT ?? '5432'),
    ssl: { rejectUnauthorized: true },
  });
}

async function run() {
  const csvPath = process.env.CSV_PATH;
  const isDryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  const importedBy = process.env.IMPORTED_BY || 'import users';

  if (!csvPath || !fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at path: ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath);
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(
    `[${isDryRun ? 'DRY RUN' : 'LIVE'}] Processing ${records.length} users...`
  );

  const gascdData = gascdDataClient();
  await gascdData.connect();
  const lookup = await lookUpCodes(gascdData, codesToLookUp(records)).finally(
    () => gascdData.end()
  );

  let import_errors = false;
  let rowcount = 1;
  let found_emails: string[] = [];
  for (const row of records) {
    rowcount += 1;
    const email_lower = row.email.toLowerCase();
    const email_redacted = redactUserInfo(email_lower);
    const user_match = await authDB
      .selectFrom(USER_DATABASE_NAME)
      .select('id')
      .where('email', '=', email_lower)
      .executeTakeFirst();
    if (user_match) {
      console.error('Existing user match: ', email_redacted, rowcount);
      import_errors = true;
    }
    for (const field of REQUIRED_FIELDS) {
      if (!row[field]) {
        console.error('Missing field: ', email_redacted, field, rowcount);
        import_errors = true;
      }
    }
    if (!ALLOWED_LOCATION_TYPES.includes(row.location_type)) {
      console.error(
        'Invalid location type: ',
        email_redacted,
        row.location_type,
        rowcount
      );
      import_errors = true;
    } else {
      // A user whose code isn't in gascd_data could sign in but see nothing
      const missing = unknownCodes(row, lookup);
      if (missing.length > 0) {
        console.error(
          `Not in gascd_data as a ${row.location_type}: `,
          email_redacted,
          missing.join(','),
          rowcount
        );
        import_errors = true;
      }
    }
    if (found_emails.includes(email_lower)) {
      console.error('Duplicate email in CSV: ', email_redacted, rowcount);
      import_errors = true;
    } else {
      found_emails.push(email_lower);
    }
  }

  if (import_errors) {
    throw new Error('Errors found in CSV. Fix and re-run');
  }

  for (const row of records) {
    const userdetails_redacted = `${redactUserInfo(row.name)} (${redactUserInfo(row.email)})`;
    const userid = generateId();
    const now = new Date();
    const grants = grantsForRow(userid, row, lookup, now);

    if (isDryRun) {
      console.log(
        `Dry Run: Would insert user ${userdetails_redacted} with ${grants.length} grant(s)`
      );
      continue;
    }

    let selectedLocationId = null;
    if (row.location_type == 'LA') {
      // LA users get their LA selected by default
      selectedLocationId = row.location_id;
    }

    // The user, their grants and the audit row are saved together or not at all
    await authDB.transaction().execute(async (trx) => {
      await trx
        .insertInto(USER_DATABASE_NAME)
        .values({
          id: userid,
          analyticsId: generateAnalyticsId(),
          name: row.name,
          registeredName: row.name,
          email: row.email,
          registeredEmail: row.email,
          emailVerified: 1,
          locationId: row.location_id,
          locationType: row.location_type,
          selectedLocationId: selectedLocationId,
          source: row.source,
          role: 'member',
        })
        .execute();
      await trx.insertInto('access_grant').values(grants).execute();
      await trx
        .insertInto('access_audit')
        .values(auditRowFor(userid, row, grants, importedBy, now))
        .execute();
    });
    console.log(
      `Created user ${userid} with ${grants.length} grant(s) - ${userdetails_redacted}`
    );
  }

  if (isDryRun) {
    console.log('[Dry run completed successfully.]');
  } else {
    console.log('Import completed successfully.');
  }
  authDB.destroy();
}

run().catch((err) => {
  authDB.destroy();
  console.error(err);
  process.exit(1);
});
