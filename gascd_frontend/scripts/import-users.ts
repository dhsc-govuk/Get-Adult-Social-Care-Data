import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';
import { redactUserInfo } from './obfuscate';

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

const USER_DATABASE_NAME = 'user';

// Usage:
// DRY_RUN=true CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts
// CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts

// Expected CSV headers:
// name,email,location_id,location_type,source
const REQUIRED_FIELDS = [
  'name',
  'email',
  'location_id',
  'location_type',
  'source',
];
const ALLOWED_LOCATION_TYPES = ['Care provider', 'Care provider location'];

async function run() {
  const csvPath = process.env.CSV_PATH;
  const isDryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';

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

  let import_errors = false;
  let rowcount = 1;
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
    }
  }

  if (import_errors) {
    throw new Error('Errors found in CSV. Fix and re-run');
  }

  for (const row of records) {
    const userdetails_redacted = `${redactUserInfo(row.name)} (${redactUserInfo(row.email)})`;
    if (isDryRun) {
      console.log(`Dry Run: Would insert user ${userdetails_redacted}`);
      continue;
    }

    const userid = generateId();
    await authDB
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
        source: row.source,
        role: 'member',
      })
      .execute();
    console.log(`Created user ${userid} - ${userdetails_redacted}`);
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
