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
 * The slice of Better Auth's endpoint context this hook relies on. Typed
 * structurally so it does not depend on which copy of @better-auth/core is
 * resolved.
 */
export type HookContext = { path?: string } | null | undefined;

/** True when the request is the One Login OAuth callback. */
export function isOneLoginCallback(ctx: HookContext): boolean {
  return (
    ctx?.path?.includes(`/oauth2/callback/${ONE_LOGIN_PROVIDER_ID}`) ?? false
  );
}

/**
 * Better Auth `databaseHooks.user.create.before`.
 *
 * User creation through One Login only happens when the client requested
 * sign-up (the Local Authority journey). The email has been verified by One
 * Login at this point, so it is checked against the LA domain allowlist and the
 * LA-specific fields are added to the row. Any other domain is refused.
 * Other creation paths (B2C, local email/password) are left untouched.
 */
export async function laSignupBeforeCreateHook(
  user: { email: string },
  ctx: HookContext
): Promise<{ data: LaUserFields } | undefined> {
  if (!isOneLoginCallback(ctx)) return undefined;

  const fields = buildLaUserFields(user.email);
  if (!fields) {
    throw new APIError('FORBIDDEN', { message: LA_DOMAIN_REJECTED_ERROR });
  }
  return { data: fields };
}
