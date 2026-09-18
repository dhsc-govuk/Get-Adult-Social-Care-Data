import { execFileSync } from 'node:child_process';
// @vitest-environment node
import { betterAuth } from 'better-auth';
import {
  authRateLimitOptions,
  withTrustedAuthIp,
  trustedClientIp,
  AUTH_IP_HEADER,
} from '@/lib/auth-rate-limit';
import { consumeRateLimit } from '@/lib/rate-limit';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

it('ignores unconfigured or malformed headers and canonicalizes IPv6', () => {
  vi.stubEnv('RATE_LIMIT_TRUSTED_IP_HEADER', 'x-verified-ip');
  expect(
    trustedClientIp(new Headers({ 'x-forwarded-for': '1.2.3.4' }))
  ).toBeNull();
  expect(
    trustedClientIp(new Headers({ 'x-verified-ip': 'spoof, 1.2.3.4' }))
  ).toBeNull();
  expect(
    trustedClientIp(new Headers({ 'x-verified-ip': '2001:0db8:0:0::1' }))
  ).toBe('2001:db8::1');
});
it('overwrites the internal trusted header, including when no trusted address exists', async () => {
  vi.stubEnv('RATE_LIMIT_TRUSTED_IP_HEADER', 'x-verified-ip');
  const handler = vi.fn(async (req: Request) =>
    Response.json({ ip: req.headers.get(AUTH_IP_HEADER) })
  );
  const response = await withTrustedAuthIp(handler)(
    new Request('http://localhost/api/auth/ok', {
      headers: { [AUTH_IP_HEADER]: '1.2.3.4' },
    })
  );
  expect(await response.json()).toEqual({ ip: null });
});
it('the pinned Better Auth HTTP handler uses atomic consume, rejects, and reports outages as 503', async () => {
  vi.stubEnv('RATE_LIMIT_ENABLED', 'true');
  vi.stubEnv('RATE_LIMIT_TRUSTED_IP_HEADER', 'x-verified-ip');
  const auth = betterAuth({
    secret: 'local-test-secret-at-least-thirty-two-characters',
    baseURL: 'http://localhost',
    rateLimit: authRateLimitOptions(),
    advanced: { ipAddress: { ipAddressHeaders: [AUTH_IP_HEADER] } },
  });
  const handler = withTrustedAuthIp(auth.handler);
  vi.mocked(consumeRateLimit).mockResolvedValue({
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 6,
  });
  const makeRequest = () =>
    new Request('http://localhost/api/auth/ok', {
      headers: { 'x-verified-ip': '203.0.113.7' },
    });
  const response = await handler(makeRequest());
  expect(response.status).toBe(429);
  expect(consumeRateLimit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'auth' }),
    expect.stringContaining('203.0.113.7')
  );
  expect(response.headers.get('Retry-After')).toBe('6');
  vi.mocked(consumeRateLimit).mockRejectedValue(
    new Error('database unavailable')
  );
  expect((await handler(makeRequest())).status).toBe(503);
});
it('uses a bounded shared bucket in production when the trusted header is unknown', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--input-type=module',
      '-e',
      `
    import { betterAuth } from 'better-auth';
    import { authRateLimitOptions, withTrustedAuthIp, AUTH_IP_HEADER } from './src/lib/auth-rate-limit.ts';
    let recordedKey;
    const options = authRateLimitOptions();
    options.customStorage.consume = async (key) => { recordedKey = key; return { allowed: false, retryAfter: 5 }; };
    const auth = betterAuth({ secret: 'local-test-secret-at-least-thirty-two-characters', baseURL: 'http://localhost',
      logger: { disabled: true }, rateLimit: options, advanced: { ipAddress: { ipAddressHeaders: [AUTH_IP_HEADER] } } });
    const response = await withTrustedAuthIp(auth.handler)(new Request('http://localhost/api/auth/ok', { headers: { 'x-forwarded-for': 'arbitrary' } }));
    console.log(JSON.stringify({ status: response.status, key: recordedKey }));
  `,
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        TEST: 'false',
        RATE_LIMIT_ENABLED: 'true',
        RATE_LIMIT_TRUSTED_IP_HEADER: '',
      },
      encoding: 'utf8',
    }
  );
  expect(JSON.parse(output)).toEqual({ status: 429, key: 'no-trusted-ip|/ok' });
});
