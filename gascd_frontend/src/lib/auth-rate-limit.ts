import { APIError } from 'better-auth/api';
import { isIP } from 'node:net';
import { positiveInteger, rateLimitsEnabled } from './rate-limit-config';
import { rateLimitUnavailable } from './rate-limit-http';

export const AUTH_IP_HEADER = 'x-gascd-trusted-client-ip';

export function trustedClientIp(headers: Headers) {
  const name = process.env.RATE_LIMIT_TRUSTED_IP_HEADER;
  // No implicit trust in client-controlled forwarded chains. Missing IPs share a bounded bucket.
  if (!name) return null;
  const candidate = headers.get(name)?.trim();
  if (!candidate || !isIP(candidate)) return null;
  // URL canonicalizes IPv6 spelling. Better Auth additionally normalizes subnet identities.
  return isIP(candidate) === 6
    ? new URL(`http://[${candidate}]/`).hostname.slice(1, -1)
    : candidate;
}

export const authRateLimitStorage = {
  // Required by 1.6's compatibility types, but never used by its atomic consume path.
  async get(): Promise<never> {
    throw new Error('Non-atomic rate-limit storage is unsupported');
  },
  async set(): Promise<never> {
    throw new Error('Non-atomic rate-limit storage is unsupported');
  },
  async consume(key: string, rule: { window: number; max: number }) {
    try {
      const { consumeRateLimit } = await import('./rate-limit');
      const result = await consumeRateLimit(
        { name: 'auth', windowSeconds: rule.window, max: rule.max },
        key
      );
      return {
        allowed: result.allowed,
        retryAfter: result.allowed ? null : result.retryAfterSeconds,
      };
    } catch {
      throw new APIError('SERVICE_UNAVAILABLE', {
        code: 'RATE_LIMIT_UNAVAILABLE',
        message: 'The service is temporarily busy. Please try again shortly.',
      });
    }
  },
};

export function authRateLimitOptions() {
  return {
    enabled: rateLimitsEnabled(),
    window: positiveInteger('RATE_LIMIT_AUTH_WINDOW_SECONDS', 10, 3600),
    max: positiveInteger('RATE_LIMIT_AUTH_MAX', 100),
    customStorage: authRateLimitStorage,
    customRules: {
      '/sign-in/*': {
        window: 10,
        max: positiveInteger('RATE_LIMIT_LOGIN_MAX', 3),
      },
      '/sign-out': false as const,
    },
  };
}

export function withTrustedAuthIp(
  handler: (request: Request) => Response | Promise<Response>
) {
  return async (request: Request) => {
    const headers = new Headers(request.headers);
    headers.delete(AUTH_IP_HEADER);
    const ip = trustedClientIp(request.headers);
    if (ip) headers.set(AUTH_IP_HEADER, ip);
    try {
      // Next.js can proxy incoming Request objects. Passing that proxy as the
      // constructor input fails Undici's private-field checks in production.
      const init: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers,
        signal: request.signal,
      };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
        if (init.body) init.duplex = 'half';
      }
      const response = await handler(new Request(request.url, init));
      // Better Auth 1.6 uses X-Retry-After; also provide the standard header to consumers.
      if (response.status === 429 || response.status === 503) {
        const headers = new Headers(response.headers);
        if (headers.has('X-Retry-After')) {
          headers.set('Retry-After', headers.get('X-Retry-After')!);
        }
        headers.set('Cache-Control', 'no-store');
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }
      return response;
    } catch {
      return rateLimitUnavailable();
    }
  };
}
