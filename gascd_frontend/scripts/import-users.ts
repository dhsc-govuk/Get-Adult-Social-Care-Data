import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

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

  for (const row of records) {
    if (isDryRun) {
      console.log(`Dry Run: Would insert user ${row.name} (${row.email})`);
      continue;
    }

    const userid = generateId();
    await authDB
      .insertInto('user')
      .values({
        id: userid,
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

  console.log('Import completed successfully.');
  authDB.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
