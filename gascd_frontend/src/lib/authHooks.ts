import { getSessionFromCtx } from 'better-auth/api';
import logger from '@/utils/logger';

type AuthHookContext = Parameters<typeof getSessionFromCtx>[0];

// Logs a "User logged out" audit event for the better-auth /sign-out endpoint.
// Runs as a `before` hook because the sign-out handler deletes the session, so
// by the `after` hook the user is no longer resolvable.
//
// The event is only logged when a real session is being ended. Without this
// guard, an unauthenticated /sign-out request would forge a false "User logged
// out" record and undermine log integrity (CWE-117).
//
// Extracted from auth.ts so it can be unit tested without pulling in the full
// better-auth/database setup.
export const logLogoutEvent = async (ctx: AuthHookContext) => {
  if (!ctx.path.startsWith('/sign-out')) {
    return;
  }

  const session = await getSessionFromCtx(ctx).catch(() => null);
  if (session?.user) {
    logger.info('User logged out', {
      userid: session.user.id,
    });
  }
};
