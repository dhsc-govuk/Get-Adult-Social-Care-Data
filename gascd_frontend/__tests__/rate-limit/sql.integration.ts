import { afterAll, beforeAll, expect, it } from 'vitest';
import { Kysely, MssqlDialect, sql } from 'kysely';
import * as Tedious from 'tedious';
import * as Tarn from 'tarn';
import { randomUUID } from 'node:crypto';
import { consumeSqlRateLimit } from '../../src/lib/rate-limit-store';
import {
  migrateRateLimits,
  cleanupRateLimits,
} from '../../src/lib/rate-limit-schema';

// This suite can only connect to an explicitly opted-in, dedicated local test database.
if (process.env.RATE_LIMIT_SQL_TEST !== 'true')
  throw new Error('Set RATE_LIMIT_SQL_TEST=true for the isolated SQL suite');
const createDb = (database = 'GASCD78RateLimitTests') =>
  new Kysely<any>({
    dialect: new MssqlDialect({
      tarn: { ...Tarn, options: { min: 0, max: 8 } },
      tedious: {
        ...Tedious,
        connectionFactory: () =>
          new Tedious.Connection({
            server: '127.0.0.1',
            authentication: {
              type: 'default',
              options: { userName: 'sa', password: 'Gascd78-Local-Test-Only!' },
            },
            options: {
              database,
              port: 15478,
              encrypt: true,
              trustServerCertificate: true,
              requestTimeout: 5000,
            },
          }),
      },
    }),
  });
const db1 = createDb(),
  db2 = createDb();
beforeAll(async () => {
  const master = createDb('master');
  try {
    await sql`IF DB_ID('GASCD78RateLimitTests') IS NULL CREATE DATABASE GASCD78RateLimitTests;`.execute(
      master
    );
  } finally {
    await master.destroy();
  }
  await migrateRateLimits(db1);
  await migrateRateLimits(db1);
});
afterAll(async () => {
  await db1.destroy();
  await db2.destroy();
});

it('admits exactly the quota during concurrent first access from independent pools', async () => {
  const id = randomUUID(),
    policy = { name: 'integration', max: 7, windowSeconds: 3600 };
  const results = await Promise.all(
    Array.from({ length: 64 }, (_, i) =>
      consumeSqlRateLimit(i % 2 ? db1 : db2, policy, id)
    )
  );
  expect(results.filter((r) => r.allowed)).toHaveLength(7);
  expect(
    results
      .filter((r) => r.allowed)
      .map((r) => r.remaining)
      .sort()
  ).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect((await consumeSqlRateLimit(db2, policy, id)).allowed).toBe(false);
  expect((await consumeSqlRateLimit(db2, policy, randomUUID())).allowed).toBe(
    true
  );
  const restarted = createDb();
  try {
    expect((await consumeSqlRateLimit(restarted, policy, id)).allowed).toBe(
      false
    );
  } finally {
    await restarted.destroy();
  }
});
it('uses database time and resets after the actual window boundary', async () => {
  const time = await sql<{
    phase: number;
  }>`SELECT CAST(DATEDIFF_BIG(millisecond, '19700101', SYSUTCDATETIME()) % 2000 AS int) AS phase;`.execute(
    db1
  );
  await new Promise((resolve) =>
    setTimeout(resolve, 2050 - time.rows[0].phase)
  );
  const id = randomUUID(),
    policy = { name: 'rollover', max: 1, windowSeconds: 2 };
  expect((await consumeSqlRateLimit(db1, policy, id)).allowed).toBe(true);
  const denied = await consumeSqlRateLimit(db2, policy, id);
  expect(denied.allowed).toBe(false);
  expect(denied.retryAfterSeconds).toBeGreaterThan(0);
  await new Promise((resolve) => setTimeout(resolve, 2100));
  expect((await consumeSqlRateLimit(db2, policy, id)).allowed).toBe(true);
});

it('bounds lock waits and rolls back before reusing the connection', async () => {
  const id = randomUUID(),
    policy = { name: 'locked', max: 2, windowSeconds: 3600 };
  await consumeSqlRateLimit(db1, policy, id);
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const locked = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const transaction = db1.transaction().execute(async (tx) => {
    await sql`UPDATE dbo.requestRateLimit SET requestCount = requestCount WHERE policy = 'locked';`.execute(
      tx
    );
    entered();
    await gate;
  });
  await locked;
  const start = Date.now();
  try {
    await expect(consumeSqlRateLimit(db2, policy, id)).rejects.toThrow();
    expect(Date.now() - start).toBeLessThan(2500);
  } finally {
    release();
    await transaction;
  }
  expect((await consumeSqlRateLimit(db2, policy, id)).allowed).toBe(true);
});
it('cleanup removes old counters but preserves active counters', async () => {
  await consumeSqlRateLimit(
    db1,
    { name: 'cleanup-live', max: 1, windowSeconds: 3600 },
    randomUUID()
  );
  await sql`INSERT INTO dbo.requestRateLimit VALUES ('expired', ${randomUUID().replaceAll('-', '').padEnd(64, '0')}, 0, 1, DATEADD(day, -2, SYSUTCDATETIME()));`.execute(
    db1
  );
  await cleanupRateLimits(db1);
  const expired = await sql<{
    count: number;
  }>`SELECT COUNT(*) AS count FROM dbo.requestRateLimit WHERE expiresAt < DATEADD(day, -1, SYSUTCDATETIME());`.execute(
    db1
  );
  expect(expired.rows[0].count).toBe(0);
  const live = await sql<{
    count: number;
  }>`SELECT COUNT(*) AS count FROM dbo.requestRateLimit WHERE expiresAt > SYSUTCDATETIME();`.execute(
    db1
  );
  expect(live.rows[0].count).toBeGreaterThan(0);
});
