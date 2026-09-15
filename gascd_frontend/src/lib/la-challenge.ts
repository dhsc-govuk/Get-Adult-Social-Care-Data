import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'la_challenge';
const MAX_AGE_SECONDS = 10 * 60;
const NONCE_BYTES = 16;

function signingSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured');
  }
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', signingSecret()).update(value).digest('base64url');
}

export async function issueLaChallenge(): Promise<void> {
  const nonce = randomBytes(NONCE_BYTES).toString('base64url');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${nonce}.${sign(nonce)}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function consumeLaChallenge(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  cookieStore.delete(COOKIE_NAME);

  if (!token) {
    return false;
  }

  const dotIndex = token.lastIndexOf('.');
  if (dotIndex < 1) {
    return false;
  }

  const nonce = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expectedBuffer = Buffer.from(sign(nonce));
  const signatureBuffer = Buffer.from(signature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}