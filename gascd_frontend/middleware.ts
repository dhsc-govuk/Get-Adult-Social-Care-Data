import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
import { rateLimitsEnabled, userPolicy } from '@/lib/rate-limit-config';
import { rateLimitResponse, rateLimitUnavailable } from '@/lib/rate-limit-http';
import { trustedClientIp } from '@/lib/auth-rate-limit';

export async function middleware(request: NextRequest) {
  // Next's nextUrl.pathname excludes the configured basePath.
  const path = request.nextUrl.pathname;
  if (path === '/api/checks/live' || path === '/api/checks/health')
    return NextResponse.next();
  // Better Auth owns its endpoint policies; these two custom routes need explicit coverage.
  if (
    path.startsWith('/api/auth/') &&
    path !== '/api/auth/local' &&
    path !== '/api/auth/logout'
  ) {
    return NextResponse.next();
  }
  try {
    if (path === '/api/auth/local') {
      if (process.env.LOCAL_AUTH !== 'true')
        return new NextResponse(null, { status: 404 });
      if (rateLimitsEnabled()) {
        const decision = await consumeRateLimit(
          { name: 'local-login', windowSeconds: 10, max: 3 },
          trustedClientIp(request.headers) ?? 'no-trusted-ip'
        );
        if (!decision.allowed) return rateLimitResponse(decision);
      }
      return NextResponse.next();
    }
    const session = await auth.api.getSession({ headers: request.headers });
    // Analytics opt-out is usable before login; its logging still needs a bounded quota.
    if (!session && path !== '/api/analytics/optout') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!rateLimitsEnabled()) return NextResponse.next();
    const policy = session
      ? userPolicy()
      : { name: 'anonymous-analytics', windowSeconds: 60, max: 30 };
    const decision = await consumeRateLimit(
      policy,
      session?.user.id ?? trustedClientIp(request.headers) ?? 'no-trusted-ip'
    );
    if (!decision.allowed) return rateLimitResponse(decision);
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(decision.remaining));
    return response;
  } catch {
    return rateLimitUnavailable();
  }
}

export const config = { runtime: 'nodejs', matcher: ['/api/:path*'] };
