import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // nextUrl.pathname excludes the basePath, so this is <basePath>/admin[/...]
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return rewriteToAdminApp(request);
  }

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
    return new NextResponse('The admin app is not configured for this environment.', {
      status: 503,
    });
  }
  const { basePath, pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL(`${basePath}${pathname}${search}`, adminRoot));
}

export const config = {
  runtime: 'nodejs', // Required for auth.api calls
  matcher: [
    // match all /api routes except /api/auth/*
    '/api/((?!auth|checks|analytics).*)',
    // proxied to the admin app, see rewriteToAdminApp
    '/admin',
    '/admin/:path*',
  ],
};
