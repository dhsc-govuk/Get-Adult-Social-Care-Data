import 'server-only';

import { cache } from 'react';
import { Kysely } from 'kysely';
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
  canChangeUser,
  groupManagedUsers,
  ManagedUser,
  AUDIT_ACTION_ACCESS_RESTORED,
  AUDIT_ACTION_ACCESS_SUSPENDED,
  AUDIT_ACTION_LOCATIONS_CHANGED,
  AUDIT_ACTION_NAME_CHANGED,
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
  GRANT_STATUS_SUSPENDED,
  InviteFields,
  legacyFieldsFromGrants,
  legacyLocationFields,
  planLocationChange,
  visibleGrants,
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
  providerCode: string,
  userId?: string,
  db: Kysely<any> = authDB
): Promise<GrantRow[]> => {
  let query = db
    .selectFrom('access_grant as g')
    .innerJoin('user as u', 'u.id', 'g.user_id')
    .leftJoin('user as gb', 'gb.id', 'g.granted_by_user_id')
    .select([
      'g.id as id',
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
    .where('g.scope_type', 'in', [GRANT_SCOPE_PROVIDER, GRANT_SCOPE_LOCATION]);
  if (userId) query = query.where('g.user_id', '=', userId);
  const rows = await query.execute();

  // One Login overwrites user.name with the email, so prefer the registered name
  return rows.map((row: any) => ({
    id: row.id,
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

type Change = {
  actor: User;
  context: ApproverContext;
  userId: string;
};

const auditRow = (
  { actor, context }: Change,
  target: GrantRow,
  action: string,
  now: Date,
  extra: { location_codes?: string | null; details?: object } = {}
) => ({
  occurred_at: now,
  action,
  actor_type: AUDIT_ACTOR_USER,
  actor_id: actor.id,
  actor_name: actor.registeredName ?? actor.name,
  actor_email: actor.email,
  target_user_id: target.userId,
  target_name: target.userName,
  target_email: target.userEmail,
  provider_code: context.providerCode,
  location_codes: extra.location_codes ?? null,
  details: extra.details ? JSON.stringify(extra.details) : null,
});

// Keeps user.locationType / locationId in step with the grants, and signs them out if they lost access
const syncLegacyFields = async (trx: Kysely<any>, userId: string) => {
  const grants = await trx
    .selectFrom('access_grant')
    .select(['scope_type', 'provider_code', 'location_code', 'status'])
    .where('user_id', '=', userId)
    .execute();
  const legacy = legacyFieldsFromGrants(grants);
  const user = await trx
    .selectFrom('user')
    .select(['locationType', 'locationId', 'selectedLocationId'])
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  const keepsSelection =
    legacy?.locationType === 'Care provider' ||
    (legacy?.locationId ?? '').split(',').includes(user.selectedLocationId);
  await trx
    .updateTable('user')
    .set({
      // Like a CQC ban: no type means no access, the old ids stay for reference
      locationType: legacy?.locationType ?? null,
      locationId: legacy?.locationId ?? user.locationId,
      updatedAt: new Date(),
      ...(keepsSelection
        ? {}
        : {
            selectedLocationId: null,
            selectedLocationDisplayName: null,
            selectedLocationCategory: null,
          }),
    })
    .where('id', '=', userId)
    .execute();

  if (!legacy || !keepsSelection) {
    await trx.deleteFrom('session').where('userId', '=', userId).execute();
  }
};

export const updateManagedUser = async (
  change: Change,
  fields: { name: string; locations: string[] }
) => {
  const { context, userId } = change;
  const now = new Date();
  await authDB.transaction().execute(async (trx) => {
    const grants = await listProviderGrants(context.providerCode, userId, trx);
    const target = grants[0];
    const name = fields.name.trim();

    if (name !== target.userName) {
      await trx
        .updateTable('user')
        .set({ registeredName: name, name, updatedAt: now })
        .where('id', '=', userId)
        .execute();
      await trx
        .insertInto('access_audit')
        .values(
          auditRow(change, target, AUDIT_ACTION_NAME_CHANGED, now, {
            details: { from: target.userName, to: name },
          })
        )
        .execute();
    }

    const plan = planLocationChange(grants, fields.locations, context);
    if (plan.added.length === 0 && plan.removed.length === 0) return;

    // New locations follow whether they have signed in yet
    const status = grants.some((g) => g.status === GRANT_STATUS_ACTIVE)
      ? GRANT_STATUS_ACTIVE
      : GRANT_STATUS_INVITED;
    if (plan.deleteIds.length) {
      await trx
        .deleteFrom('access_grant')
        .where('id', 'in', plan.deleteIds)
        .execute();
    }
    if (plan.reuseIds.length) {
      await trx
        .updateTable('access_grant')
        .set({
          status,
          status_changed_at: now,
          status_changed_by_user_id: change.actor.id,
        })
        .where('id', 'in', plan.reuseIds)
        .execute();
    }
    if (plan.insert.length) {
      await trx
        .insertInto('access_grant')
        .values(
          plan.insert.map((grant) => ({
            user_id: userId,
            scope_type: grant.scopeType,
            provider_code: context.providerCode,
            location_code: grant.locationCode,
            role: GRANT_ROLE_READER,
            basis: GRANT_BASIS_DELEGATED,
            status,
            source: GRANT_SOURCE_APPROVER,
            granted_by_user_id: change.actor.id,
            granted_at: now,
          }))
        )
        .execute();
    }
    await trx
      .insertInto('access_audit')
      .values(
        auditRow(change, target, AUDIT_ACTION_LOCATIONS_CHANGED, now, {
          location_codes: fields.locations.includes(ALL_LOCATIONS)
            ? null
            : fields.locations.join(','),
          details: { added: plan.added, removed: plan.removed },
        })
      )
      .execute();
    await syncLegacyFields(trx, userId);
  });
};

const setStatus = async (
  change: Change,
  from: (status: string) => boolean,
  to: (trx: Kysely<any>, userId: string) => Promise<string>,
  action: string
) => {
  const { context, userId } = change;
  const now = new Date();
  await authDB.transaction().execute(async (trx) => {
    const grants = await listProviderGrants(context.providerCode, userId, trx);
    const affected = visibleGrants(grants, context).filter((g) =>
      from(g.status)
    );
    if (affected.length === 0) return;

    const status = await to(trx, userId);
    await trx
      .updateTable('access_grant')
      .set({
        status,
        status_changed_at: now,
        status_changed_by_user_id: change.actor.id,
      })
      .where(
        'id',
        'in',
        affected.map((g) => g.id)
      )
      .execute();
    await trx
      .insertInto('access_audit')
      .values(
        auditRow(change, affected[0], action, now, {
          location_codes: affected.some(
            (g) => g.scopeType === GRANT_SCOPE_PROVIDER
          )
            ? null
            : affected.map((g) => g.locationCode).join(','),
        })
      )
      .execute();
    await syncLegacyFields(trx, userId);
  });
};

export const removeManagedUser = (change: Change) =>
  setStatus(
    change,
    (status) => status !== GRANT_STATUS_SUSPENDED,
    async () => GRANT_STATUS_SUSPENDED,
    AUDIT_ACTION_ACCESS_SUSPENDED
  );

// A sign-in links an account row, so without one they go back to invited
export const restoreManagedUser = (change: Change) =>
  setStatus(
    change,
    (status) => status === GRANT_STATUS_SUSPENDED,
    async (trx, userId) =>
      (await trx
        .selectFrom('account')
        .select('id')
        .where('userId', '=', userId)
        .executeTakeFirst())
        ? GRANT_STATUS_ACTIVE
        : GRANT_STATUS_INVITED,
    AUDIT_ACTION_ACCESS_RESTORED
  );

export type ChangeableUser = {
  context: ApproverContext;
  grants: GrantRow[];
  user: ManagedUser;
};

// Null unless the signed-in approver may edit, remove or restore this user
export const getChangeableUser = async (
  actor: User,
  userId: string
): Promise<ChangeableUser | null> => {
  const context = await getApproverContext(actor);
  if (!context) return null;
  const grants = await listProviderGrants(context.providerCode, userId);
  if (!canChangeUser(grants, context, actor.id)) return null;
  const [user] = groupManagedUsers(grants, context, actor.id);
  return { context, grants, user };
};
