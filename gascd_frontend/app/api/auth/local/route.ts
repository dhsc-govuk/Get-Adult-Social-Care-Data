import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';

// Utility route to support signing in as the local testing user
export async function GET(req: NextRequest) {
  if (!process.env.LOCAL_AUTH) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (!process.env.LOCAL_AUTH_EMAIL || !process.env.LOCAL_AUTH_PASSWORD) {
    logger.error('LOCAL_AUTH_EMAIL or LOCAL_AUTH_PASSWORD not found in env');
    return redirect('/');
  }

  const authResponse = await auth.api.signInEmail({
    body: {
      email: process.env.LOCAL_AUTH_EMAIL,
      password: process.env.LOCAL_AUTH_PASSWORD,
    },
    asResponse: true,
  });

  if (authResponse.status != 200) {
    logger.error('Could not log in with local auth', {
      response_code: authResponse.status,
    });
    return redirect('/');
  }

  // We're typically behind a proxy (Docker compose in local dev, Azure Container
  // Apps in deployed envs). req.url reflects the internal listener (e.g.
  // 0.0.0.0:3000) rather than the public URL, so we have to reconstruct the
  // redirect target from X-Forwarded-* headers when they're present.
  const requestedHost = req.headers.get('X-Forwarded-Host');
  const redirectUrl = new URL('/home', req.url);
  if (requestedHost) {
    const requestedPort = req.headers.get('X-Forwarded-Port');
    const requestedProto = req.headers.get('X-Forwarded-Proto');

    // Split host header in case it includes ":port" (some proxies do this)
    const [hostOnly, portFromHost] = requestedHost.split(':');
    redirectUrl.hostname = hostOnly;
    redirectUrl.protocol = requestedProto || redirectUrl.protocol;

    // Prefer X-Forwarded-Port, fall back to port embedded in host header.
    // Drop standard ports (80/443) so the URL stays clean.
    const effectivePort = requestedPort || portFromHost || '';
    if (effectivePort && effectivePort !== '80' && effectivePort !== '443') {
      redirectUrl.port = effectivePort;
    } else {
      redirectUrl.port = '';
    }
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);

  // Grab the set cookie headers from the auth API so that the redirect actually sets them
  authResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      redirectResponse.headers.append(key, value);
    }
  });

  logger.info('Local auth session started');
  return redirectResponse;
}
