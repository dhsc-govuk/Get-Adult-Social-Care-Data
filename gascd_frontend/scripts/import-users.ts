import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';
import { redactUserInfo } from './obfuscate';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

const USER_DATABASE_NAME = 'user';

type CsvRow = {
  name: string;
  email: string;
  location_id: string;
  location_type: string;
  source: string;
};

type ImportUserRow = {
  name: string;
  email: string;
  locationId: string;
  locationType: string;
  source: string;
  userId: string;
  selectedLocationId: string | null;
  role: 'member';
};

type ExistingUser = {
  createdAt: Date;
  updatedAt: Date;
  source: string | null;
  lastLoginMethod: string | null;
};

type RowValidationError = string | Record<string, Array<string>>;

type RedactedFailedRow = Record<string, RowValidationError[]>;

type PrintOutcomeParams = {
  isDryRun: boolean;
  redactedFailedRows: Array<RedactedFailedRow>;
  totalUserCountPreRun: number;
  totalUserCountPostRun: number;
  dryRunInserts: Array<string>;
  usersCreated: Array<string>;
  totalRows: number;
  totalFailed: number;
};

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

class ImportUsersDb {
  static async getUsersByEmails(emails: Array<string>) {
    const BATCH_SIZE = 1000; // MSSQL limit is 2100, stay under
    const batches = [];

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    const allRows = [];
    for (const batch of batches) {
      const rows = await authDB
        .selectFrom(USER_DATABASE_NAME)
        .select([
          'id',
          'email',
          'createdAt',
          'updatedAt',
          'source',
          'lastLoginMethod',
        ])
        .where('email', 'in', batch)
        .execute();
      allRows.push(...rows);
    }

    return new Map(allRows.map((r) => [r.email, r]));
  }

  static async getUserCount(): Promise<number> {
    const [result] = await authDB
      .selectFrom(USER_DATABASE_NAME)
      .select((eb) => eb.fn.count<number>('id').as('count'))
      .execute();
    return result.count;
  }

  static async insertUser({
    email,
    locationId,
    locationType,
    name,
    source,
    userId,
    selectedLocationId,
    role,
  }: ImportUserRow) {
    return await authDB
      .insertInto(USER_DATABASE_NAME)
      .values({
        id: userId,
        analyticsId: generateAnalyticsId(),
        name,
        registeredName: name,
        email,
        registeredEmail: email,
        emailVerified: 1,
        locationId,
        locationType,
        selectedLocationId,
        source,
        role,
      })
      .execute();
  }
}

const redactFailedRows = (
  errorDict: Record<string, RowValidationError[]>
): Array<RedactedFailedRow> =>
  Object.entries(errorDict).map(([email, errors]) => ({
    [redactUserInfo(email)]: errors,
  }));

const printOutcome = ({
  dryRunInserts,
  isDryRun,
  redactedFailedRows,
  usersCreated,
  totalUserCountPostRun,
  totalUserCountPreRun,
  totalRows,
  totalFailed,
}: PrintOutcomeParams) => {
  if (isDryRun) {
    const totalWouldInsert = dryRunInserts.length;
    console.log(
      JSON.stringify(
        {
          status: 'Dry run completed successfully.',
          summary: {
            totalRows,
            totalWouldInsert,
            totalFailed,
            reconciles: totalRows === totalWouldInsert + totalFailed,
          },
          failedRows: redactedFailedRows,
          wouldInsertUsers: dryRunInserts,
        },
        null,
        2
      )
    );
  } else {
    const totalInserted = usersCreated.length;
    console.log(
      JSON.stringify(
        {
          status: 'Import completed successfully.',
          summary: {
            totalRows,
            totalInserted,
            totalFailed,
            reconciles: totalRows === totalInserted + totalFailed,
          },
          failedRows: redactedFailedRows,
          createdUsers: usersCreated,
          verification: {
            totalUserCountPreRun,
            totalUserCountPostRun,
          },
        },
        null,
        2
      )
    );
  }
};

const getRows = (csvPath: string): Array<CsvRow> => {
  const fileContent = fs.readFileSync(csvPath);
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true, // Saving excel as csv can insert an invisible character at the start which causes this script to fail
  });
};

const buildEmailMaps = (records: Array<CsvRow>) => {
  const allEmailMap = new Map<string, Array<number>>();
  const duplicateEmails = new Set<string>();

  for (const [index, row] of records.entries()) {
    const email = row.email?.toLowerCase();
    if (!email) continue;
    const csvRowNumber = index + 2; // +2: JS index is 0-based, and row 1 of CSV is the header
    const rowsForEmail = allEmailMap.get(email) ?? [];
    rowsForEmail.push(csvRowNumber);
    allEmailMap.set(email, rowsForEmail);
    if (rowsForEmail.length > 1) {
      duplicateEmails.add(email);
    }
  }

  return { allEmailMap, duplicateEmails };
};

const validateRow = ({
  row,
  csvRowNumber,
  existingUsers,
  duplicateEmails,
  allEmailMap,
}: {
  row: CsvRow;
  csvRowNumber: number;
  existingUsers: Map<string, ExistingUser>;
  duplicateEmails: Set<string>;
  allEmailMap: Map<string, Array<number>>;
}): Array<RowValidationError> => {
  const errors: Array<RowValidationError> = [];
  const emailLower = row.email.toLowerCase();
  const emailRedacted = redactUserInfo(emailLower);
  const existingUser = existingUsers.get(emailLower);

  if (existingUser) {
    errors.push(`Existing user match: ${emailRedacted} - row ${csvRowNumber}`);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!row[field as keyof CsvRow]) {
      errors.push(
        `Missing field for: ${emailRedacted}. Missing field: ${field} - row ${csvRowNumber}`
      );
    }
  }

  if (!ALLOWED_LOCATION_TYPES.includes(row.location_type)) {
    errors.push(
      `Invalid location type for: ${emailRedacted}. Location type: ${row.location_type} - row ${csvRowNumber}`
    );
  }

  if (duplicateEmails.has(emailLower)) {
    const allRowsForEmail = allEmailMap.get(emailLower)!;
    errors.push(
      `Duplicate email in CSV: ${emailRedacted} appears in rows ${allRowsForEmail.join(', ')}`
    );
  }

  if (errors.length > 0 && existingUser) {
    errors.push({
      'Debugging info: ': [
        `User created at: ${existingUser.createdAt}`,
        `User updated at: ${existingUser.updatedAt}`,
        `User source: ${existingUser.source}`,
        `Has user logged in? ${Boolean(existingUser.lastLoginMethod)}`,
      ],
    });
  }

  return errors;
};

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

  const records = getRows(csvPath);
  const totalUserCountPreRun = await ImportUsersDb.getUserCount();

  console.log(
    `[${isDryRun ? 'DRY RUN' : 'LIVE'}] Processing ${records.length} users...`
  );

  const { allEmailMap, duplicateEmails } = buildEmailMaps(records);
  const existingUsers = await ImportUsersDb.getUsersByEmails([
    ...allEmailMap.keys(),
  ]);

  const failedRows: Record<string, Array<RowValidationError>> = {};

  for (const [index, row] of records.entries()) {
    const csvRowNumber = index + 2; // JS index is 0-based, and row 1 of CSV is the header
    const errors = validateRow({
      row,
      csvRowNumber,
      existingUsers,
      duplicateEmails,
      allEmailMap,
    });
    if (errors.length > 0) {
      failedRows[row.email.toLowerCase()] = errors;
    }
  }

  const failedEmailSet = new Set(Object.keys(failedRows));
  const validatedRecords = records.filter(
    (row) => !failedEmailSet.has(row.email.toLowerCase())
  );

  const dryRunInserts: Array<string> = [];
  const usersCreated: Array<string> = [];

  for (const row of validatedRecords) {
    const userDetailsRedacted = `${redactUserInfo(row.name)} (${redactUserInfo(row.email)})`;

    if (isDryRun) {
      dryRunInserts.push(userDetailsRedacted);
      continue;
    }

    const userId = generateId();
    const selectedLocationId =
      row.location_type === 'LA' ? row.location_id : null;

    await ImportUsersDb.insertUser({
      email: row.email,
      name: row.name,
      locationId: row.location_id,
      locationType: row.location_type,
      selectedLocationId,
      source: row.source,
      userId,
      role: 'member',
    });

    usersCreated.push(`${userId} - ${userDetailsRedacted}`);
  }

  const redactedFailedRows = redactFailedRows(failedRows);
  const totalUserCountPostRun = await ImportUsersDb.getUserCount();

  printOutcome({
    isDryRun,
    totalUserCountPreRun,
    totalUserCountPostRun,
    dryRunInserts,
    redactedFailedRows,
    usersCreated,
    totalRows: records.length,
    totalFailed: records.length - validatedRecords.length,
  });

  authDB.destroy();
}

run().catch((err) => {
  authDB.destroy();
  console.error(err);
  process.exit(1);
});
