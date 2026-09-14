import { createHmac } from 'node:crypto';

// In-memory stand-in for the Next.js request cookie store.
type StoredCookie = { value: string; options?: Record<string, unknown> };
let jar: Map<string, StoredCookie>;

vi.mock('server-only', () => ({ default: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)!.value } : undefined,
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      jar.set(name, { value, options });
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  })),
}));

import { consumeLaChallenge, issueLaChallenge } from '@/lib/la-challenge';

const COOKIE = 'la_challenge';
const SECRET = 'test-secret-for-la-challenge';

const signWith = (secret: string, nonce: string) =>
  createHmac('sha256', secret).update(nonce).digest('base64url');

beforeEach(() => {
  jar = new Map();
  vi.stubEnv('BETTER_AUTH_SECRET', SECRET);
  vi.stubEnv('NODE_ENV', 'test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('issueLaChallenge', () => {
  it('sets a signed, single-purpose cookie with hardened attributes', async () => {
    await issueLaChallenge();

    const cookie = jar.get(COOKIE);
    expect(cookie).toBeDefined();

    const [nonce, signature] = cookie!.value.split('.');
    expect(nonce.length).toBeGreaterThan(0);
    expect(signature).toBe(signWith(SECRET, nonce));

    expect(cookie!.options).toMatchObject({
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 10 * 60,
    });
  });

  it('marks the cookie secure in production only', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await issueLaChallenge();
    expect(jar.get(COOKIE)!.options).toMatchObject({ secure: true });

    jar.clear();
    vi.stubEnv('NODE_ENV', 'development');
    await issueLaChallenge();
    expect(jar.get(COOKIE)!.options).toMatchObject({ secure: false });
  });

  it('issues a fresh nonce each time', async () => {
    await issueLaChallenge();
    const first = jar.get(COOKIE)!.value;
    await issueLaChallenge();
    expect(jar.get(COOKIE)!.value).not.toBe(first);
  });

  it('throws when the signing secret is not configured', async () => {
    vi.stubEnv('BETTER_AUTH_SECRET', '');
    await expect(issueLaChallenge()).rejects.toThrow(
      'BETTER_AUTH_SECRET is not configured'
    );
    expect(jar.has(COOKIE)).toBe(false);
  });
});

describe('consumeLaChallenge', () => {
  it('accepts a freshly issued challenge exactly once', async () => {
    await issueLaChallenge();

    expect(await consumeLaChallenge()).toBe(true);
    expect(jar.has(COOKIE)).toBe(false);
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects when no challenge cookie is present', async () => {
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('clears the cookie even when the token is invalid', async () => {
    jar.set(COOKIE, { value: 'garbage' });
    expect(await consumeLaChallenge()).toBe(false);
    expect(jar.has(COOKIE)).toBe(false);
  });

  it('rejects a token with no signature separator', async () => {
    jar.set(COOKIE, { value: 'nonce-without-signature' });
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects a token whose nonce has been altered', async () => {
    const nonce = 'original-nonce';
    jar.set(COOKIE, { value: `tampered-nonce.${signWith(SECRET, nonce)}` });
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects a token whose signature has been altered', async () => {
    const nonce = 'original-nonce';
    const sig = signWith(SECRET, nonce);
    const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1);
    jar.set(COOKIE, { value: `${nonce}.${flipped}` });
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects a signature of the wrong length', async () => {
    jar.set(COOKIE, { value: 'nonce.short' });
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const nonce = 'nonce-from-elsewhere';
    jar.set(COOKIE, { value: `${nonce}.${signWith('another-secret', nonce)}` });
    expect(await consumeLaChallenge()).toBe(false);
  });

  it('rejects a token with an empty nonce', async () => {
    jar.set(COOKIE, { value: `.${signWith(SECRET, '')}` });
    expect(await consumeLaChallenge()).toBe(false);
  });
});
