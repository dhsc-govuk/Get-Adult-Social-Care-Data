// Values in access_grant / access_audit, as in gascd-apps AccessCodes.cs. Kept here so the
// import works whether or not the site's delegation code (which has its own copies) is in.
const GRANT_ROLE_READER = 'reader';
const GRANT_ROLE_APPROVER = 'approver';
const GRANT_BASIS_NI = 'nominated_individual';
const GRANT_BASIS_RM = 'registered_manager';
const GRANT_BASIS_LA_USER = 'la_user';
const GRANT_SCOPE_PROVIDER = 'provider';
const GRANT_SCOPE_LOCATION = 'location';
const GRANT_SCOPE_LA = 'local_authority';
const GRANT_STATUS_INVITED = 'invited';
// Added by a GASCD admin: the admin app, or this import
const GRANT_SOURCE_ADMIN = 'admin';
const AUDIT_ACTION_USER_ADDED = 'user_added';
const AUDIT_ACTOR_ADMIN = 'admin';

// Imported users get their access as access_grant rows as well as the user columns, so
// they have it whichever the site reads. Each code in location_id becomes one grant, the
// same way the gascd-apps backfill turns user.locationId into grants.

export type ImportRow = {
  name: string;
  email: string;
  location_id: string;
  location_type: string;
};

// Which codes exist in gascd_data, and each location's provider
export type CodeLookup = {
  providerCodes: Set<string>;
  locationProviderCodes: Map<string, string>;
  laCodes: Set<string>;
};

export type GrantRow = {
  user_id: string;
  scope_type: string;
  provider_code: string | null;
  location_code: string | null;
  la_code: string | null;
  role: string;
  basis: string;
  status: string;
  source: string;
  granted_at: Date;
};

export type CodeKind = 'provider' | 'location' | 'la';

const KIND_BY_LOCATION_TYPE: Record<string, CodeKind> = {
  'Care provider': 'provider',
  'Care provider location': 'location',
  LA: 'la',
};

export const codeKindFor = (locationType: string): CodeKind | undefined =>
  KIND_BY_LOCATION_TYPE[locationType];

// The distinct, trimmed codes in a location_id value ("P1, P2" -> ["P1", "P2"])
export const splitCodes = (locationId: string | null | undefined): string[] =>
  Array.from(
    new Set(
      (locationId ?? '')
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.length > 0)
    )
  );

// Every code in the CSV, grouped by the gascd_data table it must be found in
export function codesToLookUp(rows: ImportRow[]): Record<CodeKind, string[]> {
  const codes: Record<CodeKind, Set<string>> = {
    provider: new Set(),
    location: new Set(),
    la: new Set(),
  };
  for (const row of rows) {
    const kind = codeKindFor(row.location_type);
    if (!kind) continue;
    splitCodes(row.location_id).forEach((code) => codes[kind].add(code));
  }
  return {
    provider: Array.from(codes.provider),
    location: Array.from(codes.location),
    la: Array.from(codes.la),
  };
}

// The codes in a row that gascd_data doesn't have, so can't be granted
export function unknownCodes(row: ImportRow, lookup: CodeLookup): string[] {
  const kind = codeKindFor(row.location_type);
  return splitCodes(row.location_id).filter((code) => {
    if (kind === 'provider') return !lookup.providerCodes.has(code);
    if (kind === 'location') return !lookup.locationProviderCodes.has(code);
    return !lookup.laCodes.has(code);
  });
}

// One invited grant per code: an NI approves a whole provider, an RM one location (with
// its provider), an LA user reads one LA. Invited until their first sign-in activates it.
export function grantsForRow(
  userId: string,
  row: ImportRow,
  lookup: CodeLookup,
  now: Date
): GrantRow[] {
  const kind = codeKindFor(row.location_type);
  return splitCodes(row.location_id).map((code) => {
    const base = {
      user_id: userId,
      provider_code: null,
      location_code: null,
      la_code: null,
      status: GRANT_STATUS_INVITED,
      source: GRANT_SOURCE_ADMIN,
      granted_at: now,
    };
    if (kind === 'provider') {
      return {
        ...base,
        scope_type: GRANT_SCOPE_PROVIDER,
        provider_code: code,
        role: GRANT_ROLE_APPROVER,
        basis: GRANT_BASIS_NI,
      };
    }
    if (kind === 'location') {
      const providerCode = lookup.locationProviderCodes.get(code);
      if (!providerCode) {
        throw new Error(`Location ${code} isn't in gascd_data`);
      }
      return {
        ...base,
        scope_type: GRANT_SCOPE_LOCATION,
        provider_code: providerCode,
        location_code: code,
        role: GRANT_ROLE_APPROVER,
        basis: GRANT_BASIS_RM,
      };
    }
    return {
      ...base,
      scope_type: GRANT_SCOPE_LA,
      la_code: code,
      role: GRANT_ROLE_READER,
      basis: GRANT_BASIS_LA_USER,
    };
  });
}

// The access history row saying who added the user and what they were given
export function auditRowFor(
  userId: string,
  row: ImportRow,
  grants: GrantRow[],
  actor: string,
  now: Date
) {
  const providers = Array.from(
    new Set(grants.map((g) => g.provider_code).filter((code) => code))
  );
  const locations = grants
    .map((g) => g.location_code)
    .filter((code): code is string => !!code);
  return {
    occurred_at: now,
    action: AUDIT_ACTION_USER_ADDED,
    actor_type: AUDIT_ACTOR_ADMIN,
    actor_name: actor,
    target_user_id: userId,
    target_name: row.name,
    target_email: row.email,
    provider_code: providers.length === 1 ? providers[0] : null,
    location_codes: locations.length > 0 ? locations.join(',') : null,
    details: JSON.stringify({
      source: 'import_users',
      basis: grants[0]?.basis ?? null,
      role: grants[0]?.role ?? null,
      location_type: row.location_type,
      codes: splitCodes(row.location_id),
    }),
  };
}

type Queryable = {
  query: (
    text: string,
    values: unknown[]
  ) => Promise<{ rows: Record<string, string>[] }>;
};

// Looks the CSV's codes up in gascd_data. A location's provider is the provider its
// care_provider_fk points at, the same join the API and the admin app use.
export async function lookUpCodes(
  db: Queryable,
  codes: Record<CodeKind, string[]>
): Promise<CodeLookup> {
  const providers = await db.query(
    'SELECT code FROM public.care_providers WHERE code = ANY($1)',
    [codes.provider]
  );
  const locations = await db.query(
    `SELECT l.code AS code, p.code AS provider_code
       FROM public.care_provider_locations l
       JOIN public.care_providers p ON p.id = l.care_provider_fk
      WHERE l.code = ANY($1)`,
    [codes.location]
  );
  const las = await db.query(
    'SELECT code FROM public.local_authorities WHERE code = ANY($1)',
    [codes.la]
  );
  return {
    providerCodes: new Set(providers.rows.map((r) => r.code)),
    locationProviderCodes: new Map(
      locations.rows.map((r) => [r.code, r.provider_code])
    ),
    laCodes: new Set(las.rows.map((r) => r.code)),
  };
}
