import { createHash } from 'node:crypto';
import { Kysely, sql } from 'kysely';

export interface RateLimitPolicy {
  name: string;
  windowSeconds: number;
  max: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

// Injectable so the exact production SQL can be exercised against independent database pools.
export async function consumeSqlRateLimit(
  db: Kysely<any>,
  policy: RateLimitPolicy,
  identifier: string
): Promise<RateLimitDecision> {
  if (
    !/^[a-z0-9-]{1,48}$/.test(policy.name) ||
    !identifier ||
    identifier.length > 2048 ||
    !Number.isSafeInteger(policy.max) ||
    policy.max < 1 ||
    policy.max > 100000 ||
    !Number.isSafeInteger(policy.windowSeconds) ||
    policy.windowSeconds < 1 ||
    policy.windowSeconds > 3600
  ) {
    throw new Error('Invalid rate-limit policy or identifier');
  }
  const hash = createHash('sha256').update(identifier).digest('hex');
  const result = await sql<{
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
  }>`
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET LOCK_TIMEOUT 1000;
    DECLARE @now datetime2 = SYSUTCDATETIME();
    DECLARE @seconds bigint = DATEDIFF_BIG(second, '19700101', @now);
    DECLARE @windowSeconds int = ${policy.windowSeconds};
    DECLARE @windowId bigint = @seconds / @windowSeconds;
    DECLARE @count int = NULL, @allowed bit = 0;
    DECLARE @expiry datetime2 = DATEADD(second,
      CAST((@windowId + 1) * @windowSeconds - @seconds AS int),
      DATEADD(nanosecond, -DATEPART(nanosecond, @now), @now));
    BEGIN TRY
      BEGIN TRANSACTION;
      SELECT @count = requestCount FROM dbo.requestRateLimit WITH (UPDLOCK, HOLDLOCK)
        WHERE policy = ${policy.name} AND identifierHash = ${hash} AND windowId = @windowId;
      IF @count IS NULL
      BEGIN
        SET @count = 1;
        INSERT INTO dbo.requestRateLimit(policy, identifierHash, windowId, requestCount, expiresAt)
          VALUES (${policy.name}, ${hash}, @windowId, @count, @expiry);
        SET @allowed = 1;
      END
      ELSE IF @count < ${policy.max}
      BEGIN
        SET @count = @count + 1;
        UPDATE dbo.requestRateLimit SET requestCount = @count
          WHERE policy = ${policy.name} AND identifierHash = ${hash} AND windowId = @windowId;
        SET @allowed = 1;
      END;
      COMMIT TRANSACTION;
      SELECT @allowed AS allowed,
        CASE WHEN @count < ${policy.max} THEN ${policy.max} - @count ELSE 0 END AS remaining,
        CASE WHEN @allowed = 1 THEN 0 ELSE
          CASE WHEN DATEDIFF_BIG(millisecond, SYSUTCDATETIME(), @expiry) > 0
          THEN CAST(CEILING(DATEDIFF_BIG(millisecond, SYSUTCDATETIME(), @expiry) / 1000.0) AS int)
          ELSE 1 END END AS retryAfterSeconds;
    END TRY
    BEGIN CATCH
      IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
      THROW;
    END CATCH;
  `.execute(db);
  const row = result.rows[0];
  if (!row) throw new Error('Rate-limit store returned no decision');
  return { ...row, allowed: Boolean(row.allowed) };
}
