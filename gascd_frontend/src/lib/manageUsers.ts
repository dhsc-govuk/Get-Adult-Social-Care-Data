// Values match the gascd-apps access_grant / access_audit constants (AccessCodes.cs)
export const GRANT_ROLE_READER = 'reader';
export const GRANT_ROLE_APPROVER = 'approver';
export const GRANT_BASIS_NI = 'nominated_individual';
export const GRANT_BASIS_RM = 'registered_manager';
export const GRANT_BASIS_DELEGATED = 'delegated';
export const GRANT_SCOPE_PROVIDER = 'provider';
export const GRANT_SCOPE_LOCATION = 'location';
export const GRANT_STATUS_INVITED = 'invited';
export const GRANT_STATUS_ACTIVE = 'active';
export const GRANT_SOURCE_APPROVER = 'approver';
export const AUDIT_ACTION_USER_ADDED = 'user_added';
export const AUDIT_ACTION_FIRST_SIGN_IN = 'first_sign_in';
export const AUDIT_ACTOR_USER = 'user';

// user.source for people added by an approver
export const DELEGATED_USER_SOURCE = 'delegated';

export const ALL_LOCATIONS = 'all';
export const MANAGE_USERS_PAGE_SIZE = 20;
export const MAX_FIELD_LENGTH = 255;

export type ProviderLocation = {
  code: string;
  name: string;
};

export type ApproverBasis = typeof GRANT_BASIS_NI | typeof GRANT_BASIS_RM;

export type ApproverContext = {
  providerCode: string;
  providerName: string;
  basis: ApproverBasis;
  providerWide: boolean;
  // Locations the approver can see and give access to
  locations: ProviderLocation[];
};

export type GrantRow = {
  userId: string;
  userName: string | null;
  userEmail: string;
  scopeType: string;
  locationCode: string | null;
  basis: string;
  status: string;
  grantedByUserId: string | null;
  grantedByName: string | null;
  grantedAt: Date;
  expiresAt: Date | null;
};

export type UserStatus = 'Active' | 'Invited' | 'Removed';

export type ManagedUser = {
  userId: string;
  name: string;
  email: string;
  allLocations: boolean;
  locationNames: string[];
  grantedBy: string;
  grantedAt: Date;
  status: UserStatus;
};

const isLive = (grant: GrantRow, now: Date) =>
  !grant.expiresAt || grant.expiresAt > now;

const statusFor = (grants: GrantRow[], now: Date): UserStatus => {
  if (grants.some((g) => g.status === GRANT_STATUS_ACTIVE && isLive(g, now))) {
    return 'Active';
  }
  if (grants.some((g) => g.status === GRANT_STATUS_INVITED && isLive(g, now))) {
    return 'Invited';
  }
  return 'Removed';
};

const grantedByLabel = (grant: GrantRow, currentUserId: string) => {
  if (grant.grantedByUserId && grant.grantedByUserId === currentUserId) {
    return 'You';
  }
  if (grant.grantedByName) {
    return grant.grantedByName;
  }
  if (grant.basis === GRANT_BASIS_NI || grant.basis === GRANT_BASIS_RM) {
    return 'CQC registration';
  }
  return 'Unknown';
};

// An approver who is not provider-wide only sees their own locations, and users with access to them
export function groupManagedUsers(
  rows: GrantRow[],
  context: ApproverContext,
  currentUserId: string,
  now: Date = new Date()
): ManagedUser[] {
  const locationNames = new Map(
    context.locations.map((location) => [location.code, location.name])
  );
  const visible = rows.filter(
    (row) =>
      context.providerWide ||
      row.scopeType === GRANT_SCOPE_PROVIDER ||
      (row.locationCode !== null && locationNames.has(row.locationCode))
  );

  const byUser = new Map<string, GrantRow[]>();
  for (const row of visible) {
    byUser.set(row.userId, [...(byUser.get(row.userId) ?? []), row]);
  }

  const users = Array.from(byUser.values()).map((grants) => {
    const earliest = grants.reduce((a, b) =>
      b.grantedAt < a.grantedAt ? b : a
    );
    const allLocations = grants.some(
      (g) => g.scopeType === GRANT_SCOPE_PROVIDER
    );
    const names = allLocations
      ? []
      : grants
          .map((g) => locationNames.get(g.locationCode ?? '') ?? g.locationCode)
          .filter((name): name is string => Boolean(name))
          .sort((a, b) => a.localeCompare(b));
    return {
      userId: earliest.userId,
      name: earliest.userName || earliest.userEmail,
      email: earliest.userEmail,
      allLocations,
      locationNames: names,
      grantedBy: grantedByLabel(earliest, currentUserId),
      grantedAt: earliest.grantedAt,
      status: statusFor(grants, now),
    };
  });

  return users.sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  );
}

export type InviteFields = {
  name: string;
  email: string;
  locations: string[];
};

export type InviteErrors = Partial<Record<keyof InviteFields, string>>;

// Deliberately loose: One Login verifies the address when they sign in
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInviteName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return "Enter the user's full name";
  if (trimmed.length > MAX_FIELD_LENGTH) {
    return `Full name must be ${MAX_FIELD_LENGTH} characters or fewer`;
  }
}

export function validateInviteEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return 'Enter their email address';
  if (trimmed.length > MAX_FIELD_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
    return 'Enter an email address in the correct format, like name@example.com';
  }
}

export function validateInviteLocations(
  locations: string[],
  context: Pick<ApproverContext, 'providerWide' | 'locations'>
): string | undefined {
  if (locations.length === 0) {
    return 'Select which locations they should be able to access';
  }
  const allowed = new Set(context.locations.map((location) => location.code));
  const valid = locations.every((code) =>
    code === ALL_LOCATIONS ? context.providerWide : allowed.has(code)
  );
  if (!valid || (locations.includes(ALL_LOCATIONS) && locations.length > 1)) {
    return 'Select from the locations listed';
  }
}

export function validateInvite(
  fields: InviteFields,
  context: Pick<ApproverContext, 'providerWide' | 'locations'>
): InviteErrors {
  const errors: InviteErrors = {
    name: validateInviteName(fields.name),
    email: validateInviteEmail(fields.email),
    locations: validateInviteLocations(fields.locations, context),
  };
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message)
  ) as InviteErrors;
}

/**
 * user.locationType / locationId still decide what a user can see until the
 * app reads access_grant, so new users get both.
 */
export function legacyLocationFields(
  providerCode: string,
  locations: string[]
): { locationType: string; locationId: string } {
  if (locations.includes(ALL_LOCATIONS)) {
    return { locationType: 'Care provider', locationId: providerCode };
  }
  return {
    locationType: 'Care provider location',
    locationId: locations.join(','),
  };
}

export type PaginationItem = number | 'ellipsis';

// GOV.UK pattern: first, last, current and its neighbours, with gaps elided
export function paginationItems(
  current: number,
  total: number
): PaginationItem[] {
  const pages = new Set(
    [1, total, current - 1, current, current + 1].filter(
      (page) => page >= 1 && page <= total
    )
  );
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

export const APPROVER_DESCRIPTIONS: Record<ApproverBasis, string> = {
  [GRANT_BASIS_NI]: 'a Nominated Individual',
  [GRANT_BASIS_RM]: 'a Registered Manager',
};
