import 'server-only';
import { Kysely } from 'kysely';
import { createUserDbDialect } from './authDatabase';
import { consumeSqlRateLimit, RateLimitPolicy } from './rate-limit-store';
import logger from '@/utils/logger';
import { metrics } from '@opentelemetry/api';

// A small, separate pool prevents counter traffic from exhausting session connections.
const counterDb = new Kysely<any>({
  // Managed-identity authentication on a cold replica can exceed two seconds.
  // Allow connection setup longer while retaining the short SQL command budget.
  dialect: createUserDbDialect({
    max: 2,
    timeoutMs: 2000,
    connectionTimeoutMs: 10000,
  }),
});
let nextErrorLogAt = 0;
const meter = metrics.getMeter('gascd-rate-limiting');
const decisions = meter.createCounter('gascd.rate_limit.decisions');
const duration = meter.createHistogram('gascd.rate_limit.duration', {
  unit: 'ms',
});

export async function consumeRateLimit(
  policy: RateLimitPolicy,
  identifier: string
) {
  const started = performance.now();
  try {
    const result = await consumeSqlRateLimit(counterDb, policy, identifier);
    decisions.add(1, {
      policy: policy.name,
      outcome: result.allowed ? 'allowed' : 'rejected',
    });
    return result;
  } catch (error) {
    decisions.add(1, { policy: policy.name, outcome: 'unavailable' });
    // No identifiers or database errors (which may contain parameters) in operational logs.
    if (Date.now() >= nextErrorLogAt) {
      nextErrorLogAt = Date.now() + 30000;
      logger.error('Rate-limit store unavailable', { policy: policy.name });
    }
    throw error;
  } finally {
    duration.record(performance.now() - started, { policy: policy.name });
  }
}
