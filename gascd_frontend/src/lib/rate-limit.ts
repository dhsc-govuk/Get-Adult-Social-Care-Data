import { db } from '@/db';
import { rateLimits } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number }> {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = config;
  const windowStart = Math.floor(Date.now() / windowMs);
  const key = `${keyPrefix}:${identifier}`;
  const id = `${key}:${windowStart}`;
  const expiresAt = new Date(windowStart * windowMs + windowMs);

  // Atomic upsert: increment count or insert new row
  await db
    .insert(rateLimits)
    .values({ id, key, window: windowStart, count: 1, expiresAt })
    .onConflictDoUpdate({
      target: rateLimits.id,
      set: { count: sql`${rateLimits.count} + 1` },
    });

  // Read current count
  const [row] = await db
    .select({ count: rateLimits.count })
    .from(rateLimits)
    .where(eq(rateLimits.id, id))
    .limit(1);

  const count = row?.count ?? 0;

  // Cleanup expired windows (optional, run periodically)
  if (Math.random() < 0.01) {
    await db.delete(rateLimits).where(sql`${rateLimits.expires_at} < NOW()`);
  }

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
  };
}
