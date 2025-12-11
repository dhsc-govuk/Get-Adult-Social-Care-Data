import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // This is the recommended approach to optimistically redirect users
  // but is not a replacement for auth checks in each page/route
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs', // Required for auth.api calls
  matcher: [
    // match all /api routes except /api/auth/*
    '/api/((?!auth).*)',
  ],
};
