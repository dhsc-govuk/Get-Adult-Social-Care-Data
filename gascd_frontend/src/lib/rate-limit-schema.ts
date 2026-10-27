import { Kysely, sql } from 'kysely';

export async function migrateRateLimits(db: Kysely<any>) {
  await sql`
    IF OBJECT_ID(N'dbo.requestRateLimit', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.requestRateLimit (
        policy varchar(48) NOT NULL,
        identifierHash char(64) NOT NULL,
        windowId bigint NOT NULL,
        requestCount int NOT NULL,
        expiresAt datetime2 NOT NULL,
        CONSTRAINT PK_requestRateLimit PRIMARY KEY (policy, identifierHash, windowId),
        CONSTRAINT CK_requestRateLimit_count CHECK (requestCount >= 0)
      );
    END;
    IF NOT EXISTS (SELECT 1 FROM sys.indexes
      WHERE object_id = OBJECT_ID(N'dbo.requestRateLimit') AND name = 'IX_requestRateLimit_expiry')
      CREATE INDEX IX_requestRateLimit_expiry ON dbo.requestRateLimit(expiresAt);
  `.execute(db);
}

export async function cleanupRateLimits(db: Kysely<any>, batchSize = 1000) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10000) {
    throw new Error('Invalid cleanup batch size');
  }
  // Retain a full day to avoid competing with requests around a window boundary.
  return sql`
    DELETE TOP (${batchSize}) FROM dbo.requestRateLimit
    WHERE expiresAt < DATEADD(day, -1, SYSUTCDATETIME());
  `.execute(db);
}
