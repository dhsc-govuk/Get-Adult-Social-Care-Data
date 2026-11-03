import { APIError } from 'better-auth/api';
import { Kysely } from 'kysely';
import { isAcceptableEmail } from './domain-check';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';
import { LA_USER_TYPE } from '@/constants';
import {
  AUDIT_ACTION_USER_ADDED,
  AUDIT_ACTOR_USER,
  GRANT_ROLE_READER,
  GRANT_STATUS_ACTIVE,
} from '@/lib/manageUsers';
import { GRANT_SCOPE_LA } from '@/lib/userAccess';

/** Error code surfaced on the OAuth error redirect when the domain is not allowed. */
export const LA_DOMAIN_REJECTED_ERROR = 'la_domain_not_allowed';
/** Error code when the provider did not assert the email address as verified. */
export const LA_EMAIL_UNVERIFIED_ERROR = 'la_email_not_verified';

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
 * requested sign-up (the Local Authority journey via One Login). The provider
 * must have verified the email; it is then checked against the LA domain
 * allowlist and the LA-specific fields are added to the row. An unverified
 * email or any other domain is refused. This applies to every OAuth callback so a sign-up request
 * against another provider cannot bypass it. Non-OAuth creation paths (the
 * local email/password seed used in development) are left untouched.
 */
export async function laSignupBeforeCreateHook(
  user: { email: string; emailVerified?: boolean | null },
  ctx: HookContext
): Promise<{ data: LaUserFields } | undefined> {
  if (!isOAuthCallback(ctx)) return undefined;

  // Eligibility rests entirely on the email domain, so the provider must have
  // verified the address. Never grant LA access on an unverified email.
  if (user.emailVerified !== true) {
    throw new APIError('FORBIDDEN', { message: LA_EMAIL_UNVERIFIED_ERROR });
  }

  const fields = buildLaUserFields(user.email);
  if (!fields) {
    throw new APIError('FORBIDDEN', { message: LA_DOMAIN_REJECTED_ERROR });
  }
  return { data: fields };
}

export const GRANT_BASIS_LA_USER = 'la_user';
export const GRANT_SOURCE_SELF_SERVICE = 'self_service';

type CreatedUser = {
  id: string;
  email: string;
  source?: string | null;
  locationId?: string | null;
  registeredName?: string | null;
};

/**
 * Better Auth `databaseHooks.user.create.after`: access comes from access_grant,
 * so a self-service LA user needs their grant and its audit row. Takes the db
 * so auth.ts can call it without a circular import.
 */
export async function recordLaSelfServiceGrant(
  db: Kysely<any>,
  user: CreatedUser,
  now: Date = new Date()
) {
  if (user.source !== LA_SELF_SERVICE_SOURCE || !user.locationId) return;
  const name = user.registeredName ?? user.email;
  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto('access_grant')
      .values({
        user_id: user.id,
        scope_type: GRANT_SCOPE_LA,
        la_code: user.locationId,
        role: GRANT_ROLE_READER,
        basis: GRANT_BASIS_LA_USER,
        status: GRANT_STATUS_ACTIVE,
        source: GRANT_SOURCE_SELF_SERVICE,
        granted_at: now,
      })
      .execute();
    await trx
      .insertInto('access_audit')
      .values({
        occurred_at: now,
        action: AUDIT_ACTION_USER_ADDED,
        actor_type: AUDIT_ACTOR_USER,
        actor_id: user.id,
        actor_name: name,
        actor_email: user.email,
        target_user_id: user.id,
        target_name: name,
        target_email: user.email,
        details: JSON.stringify({
          role: GRANT_ROLE_READER,
          basis: GRANT_BASIS_LA_USER,
          scope_type: GRANT_SCOPE_LA,
          la_code: user.locationId,
        }),
      })
      .execute();
  });
}
