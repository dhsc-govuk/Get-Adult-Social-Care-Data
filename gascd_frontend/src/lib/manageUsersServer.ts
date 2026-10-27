import 'server-only';

import { cache } from 'react';
import { generateId } from 'better-auth';
import { authDB, User } from '@/lib/auth';
import { isUserRegistered } from '@/lib/permissions';
import { getAPIClient } from '@/data/dataAPI';
import { ALLOWED_CP_USER_TYPES } from '@/constants';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';
import logger from '@/utils/logger';
import {
  ALL_LOCATIONS,
  ApproverBasis,
  ApproverContext,
  AUDIT_ACTION_USER_ADDED,
  AUDIT_ACTOR_USER,
  DELEGATED_USER_SOURCE,
  GrantRow,
  GRANT_BASIS_DELEGATED,
  GRANT_BASIS_NI,
  GRANT_BASIS_RM,
  GRANT_ROLE_APPROVER,
  GRANT_ROLE_READER,
  GRANT_SCOPE_LOCATION,
  GRANT_SCOPE_PROVIDER,
  GRANT_SOURCE_APPROVER,
  GRANT_STATUS_ACTIVE,
  GRANT_STATUS_INVITED,
  InviteFields,
  legacyLocationFields,
  ProviderLocation,
} from '@/lib/manageUsers';

type ApproverScope = {
  providerCode: string;
  basis: ApproverBasis;
  providerWide: boolean;
  locationCodes: string[];
};

const getProviderCodeForLocation = async (locationCode: string) => {
  const { data } = await getAPIClient().GET(
    '/metric_locations/cp_locations/{code}',
    {
      params: {
        path: { code: locationCode },
        query: { include_parents: true },
      },
    }
  );
  return data?.provider_code ?? null;
};

// Approver rights at the provider of the user's selected location. Delegated
// users never count, whatever role their grant carries.
export const getApproverScope = cache(
  async (user: User): Promise<ApproverScope | null> => {
    if (
      !ALLOWED_CP_USER_TYPES.includes(user.locationType || '') ||
      !user.selectedLocationId ||
      !isUserRegistered(user)
    ) {
      return null;
    }
    const providerCode = await getProviderCodeForLocation(
      user.selectedLocationId
    );
    if (!providerCode) return null;

    const grants: {
      scope_type: string;
      location_code: string | null;
      basis: string;
    }[] = await authDB
      .selectFrom('access_grant')
      .select(['scope_type', 'location_code', 'basis'])
      .where('user_id', '=', user.id)
      .where('provider_code', '=', providerCode)
      .where('role', '=', GRANT_ROLE_APPROVER)
      .where('status', '=', GRANT_STATUS_ACTIVE)
      .where('basis', 'in', [GRANT_BASIS_NI, GRANT_BASIS_RM])
      .where((eb: any) =>
        eb.or([eb('expires_at', 'is', null), eb('expires_at', '>', new Date())])
      )
      .execute();
    if (grants.length === 0) return null;

    const providerWide = grants.some(
      (g) => g.scope_type === GRANT_SCOPE_PROVIDER
    );
    return {
      providerCode,
      basis: grants.some((g) => g.basis === GRANT_BASIS_NI)
        ? GRANT_BASIS_NI
        : GRANT_BASIS_RM,
      providerWide,
      locationCodes: grants
        .map((g) => g.location_code)
        .filter((code): code is string => Boolean(code)),
    };
  }
);

// Used by the header on every page, so a failure hides the link rather than the page
export const canManageUsers = async (user: User | undefined) => {
  if (!user) return false;
  try {
    return (await getApproverScope(user)) !== null;
  } catch (error) {
    logger.error('Could not check manage users access', {
      userid: user.id,
      error: (error as Error).message,
    });
    return false;
  }
};

export const getApproverContext = async (
  user: User
): Promise<ApproverContext | null> => {
  const scope = await getApproverScope(user);
  if (!scope) return null;

  const { data } = await getAPIClient().GET(
    '/organisation/care_provider/{code}',
    { params: { path: { code: scope.providerCode } } }
  );
  const providerLocations: ProviderLocation[] = (data?.locations ?? [])
    .filter((location) => location.location_code)
    .map((location) => ({
      code: location.location_code as string,
      name: location.location_name ?? (location.location_code as string),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    providerCode: scope.providerCode,
    providerName: data?.display_name ?? '',
    basis: scope.basis,
    providerWide: scope.providerWide,
    locations: scope.providerWide
      ? providerLocations
      : providerLocations.filter((location) =>
          scope.locationCodes.includes(location.code)
        ),
  };
};

export const listProviderGrants = async (
  providerCode: string
): Promise<GrantRow[]> => {
  const rows = await authDB
    .selectFrom('access_grant as g')
    .innerJoin('user as u', 'u.id', 'g.user_id')
    .leftJoin('user as gb', 'gb.id', 'g.granted_by_user_id')
    .select([
      'g.user_id as userId',
      'u.registeredName as userRegisteredName',
      'u.name as userName',
      'u.email as userEmail',
      'g.scope_type as scopeType',
      'g.location_code as locationCode',
      'g.basis as basis',
      'g.status as status',
      'g.granted_by_user_id as grantedByUserId',
      'gb.registeredName as grantedByRegisteredName',
      'gb.name as grantedByName',
      'g.granted_at as grantedAt',
      'g.expires_at as expiresAt',
    ])
    .where('g.provider_code', '=', providerCode)
    .where('g.scope_type', 'in', [GRANT_SCOPE_PROVIDER, GRANT_SCOPE_LOCATION])
    .execute();

  // One Login overwrites user.name with the email, so prefer the registered name
  return rows.map((row: any) => ({
    userId: row.userId,
    userName: row.userRegisteredName ?? row.userName,
    userEmail: row.userEmail,
    scopeType: row.scopeType,
    locationCode: row.locationCode,
    basis: row.basis,
    status: row.status,
    grantedByUserId: row.grantedByUserId,
    grantedByName: row.grantedByRegisteredName ?? row.grantedByName,
    grantedAt: new Date(row.grantedAt),
    expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
  }));
};

export const emailHasAccount = async (email: string) => {
  const lower = email.trim().toLowerCase();
  const match = await authDB
    .selectFrom('user')
    .select('id')
    .where((eb: any) =>
      eb.or([eb('email', '=', lower), eb('registeredEmail', '=', lower)])
    )
    .executeTakeFirst();
  return Boolean(match);
};

/**
 * Adds a reader at the approver's provider: the user row, one invited grant per
 * location (or one provider-wide grant) and a user_added audit row, together.
 */
export const inviteReader = async (
  actor: User,
  context: ApproverContext,
  fields: InviteFields
): Promise<string> => {
  const now = new Date();
  const userId = generateId();
  const name = fields.name.trim();
  const email = fields.email.trim().toLowerCase();
  const allLocations = fields.locations.includes(ALL_LOCATIONS);

  const grantBase = {
    user_id: userId,
    provider_code: context.providerCode,
    role: GRANT_ROLE_READER,
    basis: GRANT_BASIS_DELEGATED,
    status: GRANT_STATUS_INVITED,
    source: GRANT_SOURCE_APPROVER,
    granted_by_user_id: actor.id,
    granted_at: now,
  };
  const grants = allLocations
    ? [{ ...grantBase, scope_type: GRANT_SCOPE_PROVIDER, location_code: null }]
    : fields.locations.map((code) => ({
        ...grantBase,
        scope_type: GRANT_SCOPE_LOCATION,
        location_code: code,
      }));

  await authDB.transaction().execute(async (trx) => {
    await trx
      .insertInto('user')
      .values({
        id: userId,
        analyticsId: generateAnalyticsId(),
        name,
        registeredName: name,
        email,
        registeredEmail: email,
        emailVerified: 1,
        role: 'member',
        source: DELEGATED_USER_SOURCE,
        ...legacyLocationFields(context.providerCode, fields.locations),
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    await trx.insertInto('access_grant').values(grants).execute();
    await trx
      .insertInto('access_audit')
      .values({
        occurred_at: now,
        action: AUDIT_ACTION_USER_ADDED,
        actor_type: AUDIT_ACTOR_USER,
        actor_id: actor.id,
        actor_name: actor.registeredName ?? actor.name,
        actor_email: actor.email,
        target_user_id: userId,
        target_name: name,
        target_email: email,
        provider_code: context.providerCode,
        location_codes: allLocations ? null : fields.locations.join(','),
        details: JSON.stringify({
          role: GRANT_ROLE_READER,
          basis: GRANT_BASIS_DELEGATED,
          scope_type: allLocations
            ? GRANT_SCOPE_PROVIDER
            : GRANT_SCOPE_LOCATION,
          grants: grants.length,
        }),
      })
      .execute();
  });

  return userId;
};
