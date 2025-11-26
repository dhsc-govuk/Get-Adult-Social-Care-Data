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

  // If running in docker in development we need to rewrite the host
  const requestedHost = req.headers.get('X-Forwarded-Host');
  const redirectUrl = new URL('/home', req.url);
  if (requestedHost && requestedHost.match(/localhost/)) {
    const requestedPort = req.headers.get('X-Forwarded-Port');
    const requestedProto = req.headers.get('X-Forwarded-Proto');

    redirectUrl.host = requestedHost;
    redirectUrl.protocol = requestedProto || redirectUrl.protocol;
    if (requestedPort !== '80') {
      redirectUrl.port = requestedPort || redirectUrl.port;
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
