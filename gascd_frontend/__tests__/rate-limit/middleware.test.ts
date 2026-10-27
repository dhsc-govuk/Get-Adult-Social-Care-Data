// @vitest-environment node
import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';
import { auth } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/rate-limit', () => ({ consumeRateLimit: vi.fn() }));
vi.mock('server-only', () => ({}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('RATE_LIMIT_ENABLED', 'true');
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: 'user-a' },
  } as any);
  vi.mocked(consumeRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 4,
    retryAfterSeconds: 0,
  });
});
afterEach(() => vi.unstubAllEnvs());

it('uses the session user regardless of the forwarded header', async () => {
  for (const ip of ['1.2.3.4', 'spoof, 1.2.3.4']) {
    const response = await middleware(
      new NextRequest('http://localhost/api/get_metric_data', {
        headers: { 'x-forwarded-for': ip },
      })
    );
    expect(response.status).toBe(200);
    expect(consumeRateLimit).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'user-api' }),
      'user-a'
    );
  }
});
it('returns a precise 429 without invoking a handler', async () => {
  vi.mocked(consumeRateLimit).mockResolvedValue({
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 7,
  });
  const response = await middleware(
    new NextRequest('http://localhost/api/get_metric_data')
  );
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('7');
});
it('returns 503 on counter failure, while liveness bypasses auth and SQL', async () => {
  vi.mocked(consumeRateLimit).mockRejectedValue(new Error('unavailable'));
  expect(
    (await middleware(new NextRequest('http://localhost/api/get_metric_data')))
      .status
  ).toBe(503);
  vi.clearAllMocks();
  expect(
    (await middleware(new NextRequest('http://localhost/api/checks/live')))
      .status
  ).toBe(200);
  expect(auth.api.getSession).not.toHaveBeenCalled();
  expect(consumeRateLimit).not.toHaveBeenCalled();
});
it('does not spend counters on unauthenticated data requests', async () => {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
  expect(
    (await middleware(new NextRequest('http://localhost/api/get_metric_data')))
      .status
  ).toBe(401);
  expect(consumeRateLimit).not.toHaveBeenCalled();
});
it('limits anonymous opt-out and does not exempt similar route prefixes', async () => {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
  expect(
    (await middleware(new NextRequest('http://localhost/api/analytics/optout')))
      .status
  ).toBe(200);
  expect(consumeRateLimit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'anonymous-analytics' }),
    'no-trusted-ip'
  );
  expect(
    (await middleware(new NextRequest('http://localhost/api/checks-other')))
      .status
  ).toBe(401);
});
it('works with a Next basePath and covers custom local login', async () => {
  const request = new NextRequest(
    'http://localhost/gascd/api/get_metric_data',
    { nextConfig: { basePath: '/gascd' } }
  );
  await middleware(request);
  expect(consumeRateLimit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'user-api' }),
    'user-a'
  );
  vi.stubEnv('LOCAL_AUTH', 'false');
  expect(
    (await middleware(new NextRequest('http://localhost/api/auth/local')))
      .status
  ).toBe(404);
});
