import { APIError } from 'better-auth/api';
import { isAcceptableEmail } from './domain-check';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';
import { LA_USER_TYPE } from '@/constants';

/** Error code surfaced on the Better Auth /error redirect when the domain is not allowed. */
export const LA_DOMAIN_REJECTED_ERROR = 'la_domain_not_allowed';

const ONE_LOGIN_PROVIDER_ID = 'govuk-one-login';
export const LA_SELF_SERVICE_SOURCE = 'self-service';

export type LaUserFields = {
  locationId: string;
  selectedLocationId: string;
  locationType: typeof LA_USER_TYPE;
  registeredEmail: string;
  registeredName: string;
  source: typeof LA_SELF_SERVICE_SOURCE;
  role: 'member';
  analyticsId: string;
};

/**
 * Build the additional user fields for a self-service Local Authority sign-up,
 * or null when the (One Login verified) email is not on an allowed LA domain.
 */
export function buildLaUserFields(email: string): LaUserFields | null {
  const match = isAcceptableEmail(email);
  if (!match) return null;

  const emailLower = email.toLowerCase();
  return {
    locationId: match.location_id,
    selectedLocationId: match.location_id,
    locationType: LA_USER_TYPE,
    registeredEmail: emailLower,
    registeredName: emailLower,
    source: LA_SELF_SERVICE_SOURCE,
    role: 'member',
    analyticsId: generateAnalyticsId(),
  };
}

/**
 * The slice of Better Auth's endpoint context this hook relies on. Better Auth
 * runs database hooks inside the endpoint's async context, so `path` is the
 * route *pattern* (e.g. "/oauth2/callback/:providerId"), not the request URL,
 * and the provider is in `params`. Typed structurally so it does not depend on
 * which copy of @better-auth/core is resolved.
 */
export type HookContext =
  | { path?: string; params?: Record<string, string | undefined> }
  | null
  | undefined;

/**
 * True when the user is being created from an OAuth callback (generic OAuth
 * "/oauth2/callback/:providerId" or social "/callback/:id"). Any OAuth sign-up
 * is subject to the LA eligibility check: it is the only way a user row can be
 * created in deployed environments, and the client controls `requestSignUp`.
 */
export function isOAuthCallback(ctx: HookContext): boolean {
  const path = ctx?.path ?? '';
  return path.includes('/callback/');
}

/** Provider id for an OAuth callback context, if known. */
export function oauthProviderId(ctx: HookContext): string | undefined {
  return ctx?.params?.providerId ?? ctx?.params?.id;
}

/** @deprecated kept for callers/tests that only care about One Login. */
export function isOneLoginCallback(ctx: HookContext): boolean {
  return isOAuthCallback(ctx) && oauthProviderId(ctx) === ONE_LOGIN_PROVIDER_ID;
}

/**
 * Better Auth `databaseHooks.user.create.before`.
 *
 * User creation through an OAuth provider only happens when the client
 * requested sign-up (the Local Authority journey via One Login). The email has
 * been verified by the provider at this point, so it is checked against the LA
 * domain allowlist and the LA-specific fields are added to the row. Any other
 * domain is refused. This applies to every OAuth callback so a sign-up request
 * against another provider cannot bypass it. Non-OAuth creation paths (the
 * local email/password seed used in development) are left untouched.
 */
export async function laSignupBeforeCreateHook(
  user: { email: string },
  ctx: HookContext
): Promise<{ data: LaUserFields } | undefined> {
  if (!isOAuthCallback(ctx)) return undefined;

  const fields = buildLaUserFields(user.email);
  if (!fields) {
    throw new APIError('FORBIDDEN', { message: LA_DOMAIN_REJECTED_ERROR });
  }
  return { data: fields };
}
