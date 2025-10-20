import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // This is the recommended approach to optimistically redirect users
  // but is not a replacement for auth checks in each page/route
  // (it only checks for the presence of a cookie, not its validity)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/(.*)'], // Specify the routes the middleware applies to
};
