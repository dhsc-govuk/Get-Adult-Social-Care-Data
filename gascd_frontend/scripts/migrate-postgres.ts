import 'dotenv/config';
import { Client } from 'pg';
import * as fs from 'fs';

// Migrates the gascd_data Postgres DB from EH -> DAC. Always truncates target
// before load; FK constraints are bypassed during load via DISABLE TRIGGER ALL
// (per table). Idempotent: re-runs wipe + reload.
//
// Three modes:
//   MODE=extract  - read from SOURCE, write a JSON dump to OUTPUT_FILE
//   MODE=import   - read JSON from INPUT_FILE, TRUNCATE + INSERT into TARGET
//   MODE=migrate  - direct SOURCE -> TARGET (no intermediate file)
//
// Env per side (PREFIX = SOURCE or TARGET):
//   <PREFIX>_PG_SERVER          - FQDN
//   <PREFIX>_PG_DATABASE        - usually gascd_data
//   <PREFIX>_PG_USER            - Entra group display name (e.g. "GASCD - Postgres Readers - UAT")
//                                 or SP display name (e.g. sp-dhscacp-ghr-gascd-tst)
//   <PREFIX>_PG_ACCESS_TOKEN    - Entra access token for ossrdbms-aad.database.windows.net
//   <PREFIX>_PG_PORT            - optional, default 5432
//
// Extra:
//   OUTPUT_FILE / INPUT_FILE    - paths for extract / import modes
//   DRY_RUN=true                - import side only: skip TRUNCATE + INSERT
//
// Tables under public schema are discovered dynamically. EF Core's migrations
// table is skipped (it tracks the schema migrations, which the target has its own
// copy of from db-bootstrap).

const SKIP_TABLES = new Set<string>(['__EFMigrationsHistory']);

type TableDump = { name: string; columns: string[]; rows: any[] };

function buildConfig(prefix: 'SOURCE' | 'TARGET') {
  const host = process.env[`${prefix}_PG_SERVER`];
  const database = process.env[`${prefix}_PG_DATABASE`];
  const user = process.env[`${prefix}_PG_USER`];
  const password = process.env[`${prefix}_PG_ACCESS_TOKEN`];
  const port = Number(process.env[`${prefix}_PG_PORT`] ?? '5432');
  if (!host || !database || !user || !password) {
    throw new Error(
      `${prefix}_PG_SERVER, ${prefix}_PG_DATABASE, ${prefix}_PG_USER, ${prefix}_PG_ACCESS_TOKEN all required`
    );
  }
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
  };
}

async function listTables(client: Client): Promise<string[]> {
  const result = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  return result.rows.map((r) => r.tablename).filter((t) => !SKIP_TABLES.has(t));
}

async function listColumns(
  client: Client,
  table: string
): Promise<string[]> {
  const result = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return result.rows.map((r) => r.column_name);
}

async function extractTable(
  client: Client,
  table: string
): Promise<TableDump> {
  const columns = await listColumns(client, table);
  const res = await client.query(`SELECT * FROM public."${table}"`);
  return { name: table, columns, rows: res.rows };
}

async function runExtract() {
  const outputFile = process.env.OUTPUT_FILE;
  if (!outputFile) throw new Error('OUTPUT_FILE required in extract mode');

  console.log(`Mode: EXTRACT`);
  console.log(
    `Source: ${process.env.SOURCE_PG_SERVER} / ${process.env.SOURCE_PG_DATABASE}`
  );

  const client = new Client(buildConfig('SOURCE'));
  await client.connect();
  const tables = await listTables(client);
  console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);

  const dump: {
    exportedAt: string;
    source: { server?: string; database?: string };
    tables: TableDump[];
  } = {
    exportedAt: new Date().toISOString(),
    source: {
      server: process.env.SOURCE_PG_SERVER,
      database: process.env.SOURCE_PG_DATABASE,
    },
    tables: [],
  };

  for (const t of tables) {
    const td = await extractTable(client, t);
    console.log(`[${t}] extracted ${td.rows.length} rows (${td.columns.length} cols)`);
    dump.tables.push(td);
  }

  await client.end();
  fs.writeFileSync(outputFile, JSON.stringify(dump, replacer));
  console.log(
    `Extract complete. Wrote ${outputFile} (${fs.statSync(outputFile).size} bytes).`
  );
}

async function runImport() {
  const dryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  const inputFile = process.env.INPUT_FILE;
  if (!inputFile) throw new Error('INPUT_FILE required in import mode');

  console.log(`Mode: IMPORT (${dryRun ? 'DRY RUN' : 'LIVE'})`);
  console.log(
    `Target: ${process.env.TARGET_PG_SERVER} / ${process.env.TARGET_PG_DATABASE}`
  );

  const dump = JSON.parse(fs.readFileSync(inputFile, 'utf-8'), reviver);
  if (!dump || !Array.isArray(dump.tables))
    throw new Error('Input file format unexpected (missing .tables array)');
  console.log(
    `Loaded export from ${dump.source?.server}/${dump.source?.database} (exportedAt=${dump.exportedAt})`
  );

  const client = new Client(buildConfig('TARGET'));
  await client.connect();

  let totalInserted = 0;
  try {
    const targetTables: string[] = [];
    for (const t of dump.tables as TableDump[]) {
      targetTables.push(t.name);
    }
    const tableList = targetTables.map((n) => `public."${n}"`).join(', ');

    if (!dryRun) {
      await client.query('BEGIN');
      await client.query("SET session_replication_role = 'replica'");
      console.log(`Truncating: ${tableList}`);
      await client.query(
        `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`
      );
    } else {
      console.log(`[DRY RUN] would truncate: ${tableList}`);
    }

    for (const t of dump.tables as TableDump[]) {
      if (t.rows.length === 0) {
        console.log(`[${t.name}] no rows`);
        continue;
      }
      const cols = t.columns;
      const colList = cols.map((c) => `"${c}"`).join(', ');
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < t.rows.length; i += BATCH) {
        const batch = t.rows.slice(i, i + BATCH);
        const values: any[] = [];
        const placeholders: string[] = [];
        let p = 1;
        for (const row of batch) {
          const rowParams: string[] = [];
          for (const c of cols) {
            rowParams.push(`$${p++}`);
            values.push((row as any)[c] ?? null);
          }
          placeholders.push(`(${rowParams.join(', ')})`);
        }
        if (!dryRun) {
          await client.query(
            `INSERT INTO public."${t.name}" (${colList}) VALUES ${placeholders.join(', ')}`,
            values
          );
        }
        inserted += batch.length;
      }
      console.log(`[${t.name}] inserted ${inserted} rows`);
      totalInserted += inserted;
    }

    if (!dryRun) {
      // Restore trigger enforcement before committing the transaction.
      await client.query("SET session_replication_role = 'origin'");
      await client.query('COMMIT');
    }
  } catch (e) {
    if (!dryRun) await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }

  console.log(
    dryRun
      ? `Dry run complete. Would have inserted ${totalInserted} rows.`
      : `Import complete. Inserted ${totalInserted} rows.`
  );
}

async function runDirectMigrate() {
  const dryRun = (process.env.DRY_RUN || '').toLowerCase() === 'true';
  console.log(`Mode: MIGRATE (${dryRun ? 'DRY RUN' : 'LIVE'})`);
  // Implementation = extract into memory, then import. Falls outside the
  // workflow's normal two-job split; kept for ad-hoc local use only.
  const src = new Client(buildConfig('SOURCE'));
  const tgt = new Client(buildConfig('TARGET'));
  await src.connect();
  await tgt.connect();
  try {
    const tables = await listTables(src);
    const tableDumps: TableDump[] = [];
    for (const t of tables) {
      tableDumps.push(await extractTable(src, t));
    }
    const tableList = tables.map((n) => `public."${n}"`).join(', ');
    if (!dryRun) {
      await tgt.query('BEGIN');
      await tgt.query("SET session_replication_role = 'replica'");
      await tgt.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
    }
    let totalInserted = 0;
    for (const td of tableDumps) {
      if (td.rows.length === 0) continue;
      const colList = td.columns.map((c) => `"${c}"`).join(', ');
      const BATCH = 500;
      for (let i = 0; i < td.rows.length; i += BATCH) {
        const batch = td.rows.slice(i, i + BATCH);
        const values: any[] = [];
        const placeholders: string[] = [];
        let p = 1;
        for (const row of batch) {
          const rp: string[] = [];
          for (const c of td.columns) {
            rp.push(`$${p++}`);
            values.push((row as any)[c] ?? null);
          }
          placeholders.push(`(${rp.join(', ')})`);
        }
        if (!dryRun) {
          await tgt.query(
            `INSERT INTO public."${td.name}" (${colList}) VALUES ${placeholders.join(', ')}`,
            values
          );
        }
        totalInserted += batch.length;
      }
      console.log(`[${td.name}] ${td.rows.length} rows`);
    }
    if (!dryRun) {
      await tgt.query("SET session_replication_role = 'origin'");
      await tgt.query('COMMIT');
    }
    console.log(
      dryRun
        ? `Dry run complete. ${totalInserted} rows.`
        : `Migration complete. Inserted ${totalInserted} rows.`
    );
  } catch (e) {
    if (!dryRun) await tgt.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await src.end();
    await tgt.end();
  }
}

// JSON helpers - preserve Date, Buffer, BigInt across the file handoff.
function replacer(_key: string, value: any) {
  if (value instanceof Date) return { __t: 'date', v: value.toISOString() };
  if (typeof value === 'bigint') return { __t: 'bigint', v: value.toString() };
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
  if (value && typeof value === 'object' && value.__t === 'bigint')
    return BigInt(value.v);
  if (value && typeof value === 'object' && value.__t === 'buffer')
    return Buffer.from(value.v, 'base64');
  return value;
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
      throw new Error(`Unknown MODE=${mode} (expected: extract | import | migrate)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
