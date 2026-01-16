import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

const USER_DATABASE_NAME = 'user';

// Usage:
// DRY_RUN=true CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts
// CSV_PATH=./testimport.csv npx tsx ./scripts/import-users.ts

// Expected CSV headers:
// name,email,location_id,location_type,source
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
  for (const row of records) {
    const email_lower = row.email.toLowerCase();
    const user_match = await authDB
      .selectFrom(USER_DATABASE_NAME)
      .select('id')
      .where('email', '=', email_lower)
      .executeTakeFirst();
    if (user_match) {
      console.error('Existing user match: ', email_lower);
      import_errors = true;
    }
  }

  if (import_errors) {
    throw new Error('Existing users found in CSV. Please remove and re-run');
  }

  for (const row of records) {
    if (isDryRun) {
      console.log(`Dry Run: Would insert user ${row.name} (${row.email})`);
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
    console.log(`Created user ${userid} - ${row.name} (${row.email})`);
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
