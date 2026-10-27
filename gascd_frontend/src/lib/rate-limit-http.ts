import { RateLimitDecision } from './rate-limit-store';

export function rateLimitResponse(decision: RateLimitDecision) {
  return Response.json(
    {
      code: 'RATE_LIMITED',
      error: 'Too many requests. Please wait and try again.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(decision.retryAfterSeconds),
        'X-RateLimit-Remaining': String(decision.remaining),
        'Cache-Control': 'no-store',
      },
    }
  );
}

export function rateLimitUnavailable() {
  return Response.json(
    {
      code: 'RATE_LIMIT_UNAVAILABLE',
      error: 'The service is temporarily busy. Please try again shortly.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
