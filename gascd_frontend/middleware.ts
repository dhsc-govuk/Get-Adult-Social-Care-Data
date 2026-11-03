import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
import { rateLimitsEnabled, userPolicy } from '@/lib/rate-limit-config';
import { rateLimitResponse, rateLimitUnavailable } from '@/lib/rate-limit-http';
import { trustedClientIp } from '@/lib/auth-rate-limit';

export async function middleware(request: NextRequest) {
  // Next's nextUrl.pathname excludes the configured basePath.
  const path = request.nextUrl.pathname;
  // The admin app has its own One Login session; it is neither gated by the
  // frontend's Better Auth session nor counted against its rate limits.
  if (path === '/admin' || path.startsWith('/admin/')) {
    return rewriteToAdminApp(request);
  }
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

/**
 * The GASCD admin app (gascd-apps/gascd-admin) is a separate Container App with no route of its
 * own at the edge (Front Door / App Gateway are DHSC-central), so the frontend proxies
 * <basePath>/admin/* to it over the Container Apps environment network. The full public path is
 * forwarded unchanged: the admin app runs with PATH_BASE=<basePath>/admin and strips it itself,
 * so this is a removable shim should a dedicated edge route ever be added. It has its own
 * GOV.UK One Login sign-in and session cookie (scoped to <basePath>/admin); nothing here is
 * shared with the frontend's Better Auth session.
 *
 * ADMIN_APP_ROOT is the admin app's FQDN, e.g.
 * https://ca-gascd-admin-dev-uks.<cae default domain>, set in the container app values file.
 */
function rewriteToAdminApp(request: NextRequest) {
  const adminRoot = process.env.ADMIN_APP_ROOT;
  if (!adminRoot) {
    return new NextResponse(
      'The admin app is not configured for this environment.',
      {
        status: 503,
      }
    );
  }
  const { basePath, pathname, search } = request.nextUrl;
  return NextResponse.rewrite(
    new URL(`${basePath}${pathname}${search}`, adminRoot)
  );
}

export const config = {
  runtime: 'nodejs', // Required for auth.api calls
  matcher: [
    // every API route; exemptions are decided above, not here
    '/api/:path*',
    // proxied to the admin app, see rewriteToAdminApp
    '/admin',
    '/admin/:path*',
  ],
};
