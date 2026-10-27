import { Kysely } from 'kysely';
import {
  GRANT_SCOPE_LOCATION,
  GRANT_SCOPE_PROVIDER,
  GRANT_STATUS_ACTIVE,
  GRANT_STATUS_INVITED,
} from '@/lib/manageUsers';
import { LA_USER_TYPE } from '@/constants';

export const GRANT_SCOPE_LA = 'local_authority';

// What a user can see, from their live access_grant rows
export type UserAccess = {
  providerCodes: string[];
  locationCodes: string[];
  laCodes: string[];
};

export type AccessGrantScope = {
  scope_type: string;
  provider_code: string | null;
  location_code: string | null;
  la_code: string | null;
  status: string;
  expires_at: Date | string | null;
};

const unique = (codes: (string | null)[]) =>
  Array.from(new Set(codes.filter((code): code is string => !!code)));

// Invited counts as live: those grants are only activated by the sign-in itself
export function accessFromGrants(
  grants: AccessGrantScope[],
  now: Date = new Date()
): UserAccess {
  const live = grants.filter(
    (g) =>
      (g.status === GRANT_STATUS_ACTIVE || g.status === GRANT_STATUS_INVITED) &&
      (!g.expires_at || new Date(g.expires_at) > now)
  );
  const codesFor = (scope: string, field: keyof AccessGrantScope) =>
    unique(
      live.filter((g) => g.scope_type === scope).map((g) => g[field] as string)
    );
  return {
    providerCodes: codesFor(GRANT_SCOPE_PROVIDER, 'provider_code'),
    locationCodes: codesFor(GRANT_SCOPE_LOCATION, 'location_code'),
    laCodes: codesFor(GRANT_SCOPE_LA, 'la_code'),
  };
}

// The session's locationType / locationId, so existing checks read the grants
export function locationFieldsFromAccess(access: UserAccess): {
  locationType: string | null;
  locationId: string | null;
} {
  if (access.laCodes.length > 0) {
    return { locationType: LA_USER_TYPE, locationId: access.laCodes.join(',') };
  }
  if (access.providerCodes.length > 0) {
    return {
      locationType: 'Care provider',
      locationId: [...access.providerCodes, ...access.locationCodes].join(','),
    };
  }
  if (access.locationCodes.length > 0) {
    return {
      locationType: 'Care provider location',
      locationId: access.locationCodes.join(','),
    };
  }
  return { locationType: null, locationId: null };
}

// Takes the db so auth.ts can call it without a circular import
export const loadUserAccess = async (
  db: Kysely<any>,
  userId: string
): Promise<UserAccess> =>
  accessFromGrants(
    await db
      .selectFrom('access_grant')
      .select([
        'scope_type',
        'provider_code',
        'location_code',
        'la_code',
        'status',
        'expires_at',
      ])
      .where('user_id', '=', userId)
      .execute()
  );
