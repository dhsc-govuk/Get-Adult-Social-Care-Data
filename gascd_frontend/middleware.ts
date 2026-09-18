import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // This is the recommended approach to optimistically redirect users
  // but is not a replacement for auth checks in each page/route
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';

  const { allowed, remaining } = await checkRateLimit(ip, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs', // Required for auth.api calls
  matcher: [
    // match all /api routes except /api/auth/*
    '/api/((?!auth|checks|analytics).*)',
  ],
};
