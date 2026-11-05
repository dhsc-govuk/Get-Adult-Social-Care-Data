import {
  ApproverContext,
  delegatedReaderFields,
  isFixedGrant,
  canChangeUser,
  lockedReason,
  currentLocationSelection,
  fixedLocationSelection,
  legacyFieldsFromGrants,
  planLocationChange,
  GrantRow,
  groupManagedUsers,
  legacyLocationFields,
  paginationItems,
  validateInvite,
} from '@/lib/manageUsers';

const NOW = new Date('2026-10-27T12:00:00Z');

const LOCATIONS = [
  { code: 'L1', name: 'Ivy House' },
  { code: 'L2', name: 'Oak Lodge' },
  { code: 'L3', name: 'Pine Hill' },
];

const niContext: ApproverContext = {
  providerCode: 'P1',
  providerName: 'Test Provider',
  basis: 'nominated_individual',
  providerWide: true,
  locations: LOCATIONS,
};

const rmContext: ApproverContext = {
  ...niContext,
  basis: 'registered_manager',
  providerWide: false,
  locations: [LOCATIONS[0]],
};

const CQC = 'Admin file bulk upload - 3';

let nextId = 1;
const grant = (overrides: Partial<GrantRow>): GrantRow => ({
  id: nextId++,
  userId: 'u1',
  userName: 'Priya Shah',
  userEmail: 'priya@example.org',
  userSource: 'delegated',
  scopeType: 'location',
  locationCode: 'L1',
  basis: 'delegated',
  status: 'active',
  grantedByUserId: 'approver',
  grantedByName: 'Mark Allen',
  grantedAt: new Date('2026-08-14T09:00:00Z'),
  expiresAt: null,
  statusChangedAt: null,
  ...overrides,
});

describe('groupManagedUsers', () => {
  it('gives one row per user listing their locations by name', () => {
    const users = groupManagedUsers(
      [grant({ locationCode: 'L2' }), grant({ locationCode: 'L1' })],
      niContext,
      'someone-else',
      NOW
    );

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      name: 'Priya Shah',
      email: 'priya@example.org',
      allLocations: false,
      locationNames: ['Ivy House', 'Oak Lodge'],
      grantedBy: 'Mark Allen',
      status: 'Active',
    });
  });

  it("shows the most senior role across a user's grants", () => {
    const roles = (grants: Partial<GrantRow>[]) =>
      groupManagedUsers(grants.map(grant), niContext, 'x', NOW)[0].role;

    expect(roles([{}])).toBe('Invited user');
    expect(
      roles([
        { locationCode: 'L1', basis: 'registered_manager' },
        { locationCode: 'L2' },
      ])
    ).toBe('Registered Manager');
    expect(
      roles([
        {
          scopeType: 'provider',
          locationCode: null,
          basis: 'nominated_individual',
        },
      ])
    ).toBe('Nominated Individual');
  });

  it('leaves out locations taken away while others are still live', () => {
    const [user] = groupManagedUsers(
      [
        grant({ id: 1, locationCode: 'L1', status: 'suspended' }),
        grant({ id: 2, locationCode: 'L2' }),
      ],
      niContext,
      'x',
      NOW
    );
    expect(user.status).toBe('Active');
    expect(user.locationNames).toEqual(['Oak Lodge']);
  });

  it('lists the locations a removed user would get back', () => {
    const [user] = groupManagedUsers(
      [
        grant({ id: 1, locationCode: 'L1', status: 'suspended' }),
        grant({ id: 2, locationCode: 'L2', status: 'suspended' }),
      ],
      niContext,
      'x',
      NOW
    );
    expect(user.status).toBe('Removed');
    expect(user.locationNames).toEqual(['Ivy House', 'Oak Lodge']);
  });

  it('shows a provider-wide grant as all locations', () => {
    const [user] = groupManagedUsers(
      [grant({ scopeType: 'provider', locationCode: null })],
      niContext,
      'x',
      NOW
    );
    expect(user.allLocations).toBe(true);
    expect(user.locationNames).toEqual([]);
  });

  it('says "You" when the viewer gave access, and tells CQC users from ones the GASCD team added', () => {
    const backfilled = {
      basis: 'nominated_individual',
      scopeType: 'provider',
      locationCode: null,
      grantedByUserId: null,
      grantedByName: null,
    };
    const users = groupManagedUsers(
      [
        grant({ userId: 'u1', userName: 'Amy', grantedByUserId: 'me' }),
        grant({
          ...backfilled,
          userId: 'u2',
          userName: 'Bob CQC',
          userSource: 'Admin file bulk upload - 12',
        }),
        grant({
          ...backfilled,
          userId: 'u3',
          userName: 'Cat Manual',
          userSource: 'manual',
        }),
      ],
      niContext,
      'me',
      NOW
    );
    expect(users.map((u) => u.grantedBy)).toEqual([
      'You',
      'CQC registration',
      'GASCD team',
    ]);
  });

  it('uses the earliest grant for who gave access and when', () => {
    const [user] = groupManagedUsers(
      [
        grant({
          locationCode: 'L2',
          grantedByName: 'Later Person',
          grantedAt: new Date('2026-09-01T00:00:00Z'),
        }),
        grant({
          locationCode: 'L1',
          grantedByName: 'First Person',
          grantedAt: new Date('2026-01-01T00:00:00Z'),
        }),
      ],
      niContext,
      'x',
      NOW
    );
    expect(user.grantedBy).toBe('First Person');
    expect(user.grantedAt).toEqual(new Date('2026-01-01T00:00:00Z'));
  });

  it.each([
    [['active'], 'Active'],
    [['invited'], 'Invited'],
    [['suspended'], 'Removed'],
    [['suspended', 'invited'], 'Invited'],
    [['invited', 'active'], 'Active'],
  ])('maps grant statuses %j to %s', (statuses, expected) => {
    const [user] = groupManagedUsers(
      statuses.map((status, i) =>
        grant({ status, locationCode: LOCATIONS[i].code })
      ),
      niContext,
      'x',
      NOW
    );
    expect(user.status).toBe(expected);
  });

  it('hides users removed more than a year ago', () => {
    const removed = (statusChangedAt: string) =>
      grant({
        status: 'suspended',
        statusChangedAt: new Date(statusChangedAt),
      });
    expect(
      groupManagedUsers([removed('2025-11-01T00:00:00Z')], niContext, 'x', NOW)
    ).toHaveLength(1);
    expect(
      groupManagedUsers([removed('2025-10-01T00:00:00Z')], niContext, 'x', NOW)
    ).toHaveLength(0);
  });

  it('treats an expired grant as removed', () => {
    const [user] = groupManagedUsers(
      [grant({ expiresAt: new Date('2026-10-01T00:00:00Z') })],
      niContext,
      'x',
      NOW
    );
    expect(user.status).toBe('Removed');
  });

  it('limits a Registered Manager to users and locations they manage', () => {
    const users = groupManagedUsers(
      [
        grant({ userId: 'both', userName: 'A', locationCode: 'L1' }),
        grant({ userId: 'both', userName: 'A', locationCode: 'L2' }),
        grant({ userId: 'other', userName: 'B', locationCode: 'L3' }),
        grant({
          userId: 'ni',
          userName: 'C',
          scopeType: 'provider',
          locationCode: null,
        }),
      ],
      rmContext,
      'x',
      NOW
    );
    expect(users.map((u) => u.userId)).toEqual(['both', 'ni']);
    expect(users[0].locationNames).toEqual(['Ivy House']);
    expect(users[1].allLocations).toBe(true);
  });

  it('sorts by name and falls back to the email', () => {
    const users = groupManagedUsers(
      [
        grant({ userId: 'u1', userName: 'zoe' }),
        grant({ userId: 'u2', userName: null, userEmail: 'adam@example.org' }),
      ],
      niContext,
      'x',
      NOW
    );
    expect(users.map((u) => u.name)).toEqual(['adam@example.org', 'zoe']);
  });
});

describe('validateInvite', () => {
  const valid = {
    name: 'Tina Singh',
    email: 'tina@example.com',
    locations: ['L1'],
  };

  it('accepts a valid invite', () => {
    expect(validateInvite(valid, niContext)).toEqual({});
  });

  it('requires every field', () => {
    expect(
      validateInvite({ name: ' ', email: '', locations: [] }, niContext)
    ).toEqual({
      name: "Enter the user's full name",
      email: 'Enter their email address',
      locations: 'Select which locations they should be able to access',
    });
  });

  it('rejects a badly formatted email', () => {
    expect(
      validateInvite({ ...valid, email: 'not-an-email' }, niContext).email
    ).toMatch(/correct format/);
  });

  it('only lets a provider-wide approver give all locations', () => {
    expect(validateInvite({ ...valid, locations: ['all'] }, niContext)).toEqual(
      {}
    );
    expect(
      validateInvite({ ...valid, locations: ['all'] }, rmContext).locations
    ).toBe('Select from the locations listed');
  });

  it('rejects locations the approver does not have', () => {
    expect(
      validateInvite({ ...valid, locations: ['L2'] }, rmContext).locations
    ).toBe('Select from the locations listed');
    expect(
      validateInvite({ ...valid, locations: ['ELSEWHERE'] }, niContext)
        .locations
    ).toBe('Select from the locations listed');
  });

  it('rejects all locations combined with specific ones', () => {
    expect(
      validateInvite({ ...valid, locations: ['all', 'L1'] }, niContext)
        .locations
    ).toBe('Select from the locations listed');
  });
});

describe('legacyLocationFields', () => {
  it('maps all locations to the provider', () => {
    expect(legacyLocationFields('P1', ['all'])).toEqual({
      locationType: 'Care provider',
      locationId: 'P1',
    });
  });

  it('maps specific locations to a comma-separated list', () => {
    expect(legacyLocationFields('P1', ['L1', 'L2'])).toEqual({
      locationType: 'Care provider location',
      locationId: 'L1,L2',
    });
  });
});

describe('paginationItems', () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [7, 42, [1, 'ellipsis', 6, 7, 8, 'ellipsis', 42]],
    [1, 10, [1, 2, 'ellipsis', 10]],
    [10, 10, [1, 'ellipsis', 9, 10]],
  ])('page %i of %i', (current, total, expected) => {
    expect(paginationItems(current, total)).toEqual(expected);
  });
});

describe('canChangeUser', () => {
  it('allows users given access by an approver', () => {
    expect(canChangeUser([grant({})], niContext, 'me')).toBe(true);
  });

  it('never allows a CQC registered NI or yourself', () => {
    expect(
      canChangeUser(
        [
          grant({
            basis: 'nominated_individual',
            scopeType: 'provider',
            locationCode: null,
            userSource: CQC,
          }),
        ],
        niContext,
        'me'
      )
    ).toBe(false);
    expect(canChangeUser([grant({ userId: 'me' })], niContext, 'me')).toBe(
      false
    );
  });

  it('lets an NI or RM change and remove users the GASCD team set up', () => {
    const teamRm = grant({
      basis: 'registered_manager',
      userSource: 'Internal',
    });
    for (const context of [niContext, rmContext]) {
      const [user] = groupManagedUsers([teamRm], context, 'me', NOW);
      expect(user).toMatchObject({ canChange: true, canRemove: true });
    }
  });

  it('lets an NI give a CQC registered RM more locations, but not remove them', () => {
    const cqcRm = grant({ basis: 'registered_manager', userSource: CQC });
    const [user] = groupManagedUsers([cqcRm], niContext, 'me', NOW);
    expect(user).toMatchObject({ canChange: true, canRemove: false });
    expect(canChangeUser([cqcRm], rmContext, 'me')).toBe(false);
  });

  it('lets any approver add back a former CQC RM or NI the register dropped', () => {
    const formerRm = grant({
      basis: 'registered_manager',
      userSource: CQC,
      status: 'suspended',
    });
    expect(canChangeUser([formerRm], rmContext, 'me')).toBe(true);

    const formerNi = grant({
      basis: 'nominated_individual',
      scopeType: 'provider',
      locationCode: null,
      userSource: CQC,
      status: 'suspended',
    });
    expect(canChangeUser([formerNi], niContext, 'me')).toBe(true);
    // Their access covered every location, so only an NI can give it back
    expect(canChangeUser([formerNi], rmContext, 'me')).toBe(false);
  });

  it('stops a Registered Manager changing all-locations users or users elsewhere', () => {
    expect(
      canChangeUser(
        [grant({ scopeType: 'provider', locationCode: null })],
        rmContext,
        'me'
      )
    ).toBe(false);
    expect(
      canChangeUser([grant({ locationCode: 'L2' })], rmContext, 'me')
    ).toBe(false);
    expect(
      canChangeUser(
        [grant({ locationCode: 'L1' }), grant({ locationCode: 'L2' })],
        rmContext,
        'me'
      )
    ).toBe(true);
  });
});

describe('lockedReason', () => {
  it('explains why a user cannot be changed', () => {
    const ni = { basis: 'nominated_individual' };
    expect(lockedReason([grant({})], niContext, 'me')).toBeNull();
    expect(lockedReason([grant({ userId: 'me' })], niContext, 'me')).toBe(
      'Your own access'
    );
    expect(
      lockedReason(
        [
          grant({
            ...ni,
            scopeType: 'provider',
            locationCode: null,
            userSource: CQC,
          }),
        ],
        niContext,
        'me'
      )
    ).toBe('Managed by CQC registration');
    expect(
      lockedReason(
        [grant({ scopeType: 'provider', locationCode: null })],
        rmContext,
        'me'
      )
    ).toBe('Only a Nominated Individual can change this user');
  });
});

describe('currentLocationSelection', () => {
  it('lists live locations the approver can see', () => {
    expect(
      currentLocationSelection(
        [
          grant({ locationCode: 'L1' }),
          grant({ locationCode: 'L2' }),
          grant({ locationCode: 'L3', status: 'suspended' }),
        ],
        niContext
      )
    ).toEqual(['L1', 'L2']);
    expect(
      currentLocationSelection(
        [grant({ locationCode: 'L1' }), grant({ locationCode: 'L2' })],
        rmContext
      )
    ).toEqual(['L1']);
  });

  it('gives all for a provider-wide grant', () => {
    expect(
      currentLocationSelection(
        [grant({ scopeType: 'provider', locationCode: null })],
        niContext
      )
    ).toEqual(['all']);
  });
});

describe('planLocationChange', () => {
  it('deletes dropped locations and inserts new ones', () => {
    const l1 = grant({ locationCode: 'L1' });
    const l2 = grant({ locationCode: 'L2' });

    expect(planLocationChange([l1, l2], ['L2', 'L3'], niContext)).toEqual({
      deleteIds: [l1.id],
      suspendIds: [],
      reuseIds: [],
      insert: [{ scopeType: 'location', locationCode: 'L3' }],
      added: ['L3'],
      removed: ['L1'],
    });
  });

  it('reuses a suspended grant instead of inserting a duplicate', () => {
    const suspended = grant({ locationCode: 'L2', status: 'suspended' });

    const plan = planLocationChange(
      [grant({ locationCode: 'L1' }), suspended],
      ['L1', 'L2'],
      niContext
    );
    expect(plan.reuseIds).toEqual([suspended.id]);
    expect(plan.insert).toEqual([]);
  });

  it('swaps between all locations and specific ones', () => {
    const l1 = grant({ locationCode: 'L1' });
    expect(planLocationChange([l1], ['all'], niContext)).toMatchObject({
      deleteIds: [l1.id],
      insert: [{ scopeType: 'provider', locationCode: null }],
    });

    const all = grant({ scopeType: 'provider', locationCode: null });
    expect(planLocationChange([all], ['L1'], niContext)).toMatchObject({
      deleteIds: [all.id],
      insert: [{ scopeType: 'location', locationCode: 'L1' }],
    });
  });

  it('leaves a CQC RM’s own locations alone and suspends the GASCD team’s', () => {
    const cqc = grant({ basis: 'registered_manager', userSource: CQC });
    const extra = grant({ locationCode: 'L2' });
    const plan = planLocationChange([cqc, extra], ['L3'], niContext);
    expect(plan.deleteIds).toEqual([extra.id]);
    expect(plan.removed).toEqual(['L2']);

    const team = grant({ basis: 'registered_manager', userSource: 'Internal' });
    expect(planLocationChange([team], ['L2'], niContext)).toMatchObject({
      deleteIds: [],
      suspendIds: [team.id],
    });
  });

  it('reuses a former CQC RM’s suspended grant to add them back', () => {
    const formerRm = grant({
      basis: 'registered_manager',
      userSource: CQC,
      status: 'suspended',
    });
    expect(planLocationChange([formerRm], ['L1'], niContext)).toMatchObject({
      reuseIds: [formerRm.id],
      insert: [],
      added: ['L1'],
    });
  });

  it('leaves locations outside a Registered Manager’s own alone', () => {
    const elsewhere = grant({ locationCode: 'L2' });
    const plan = planLocationChange(
      [grant({ locationCode: 'L1' }), elsewhere],
      [],
      rmContext
    );
    expect(plan.removed).toEqual(['L1']);
    expect(plan.deleteIds).not.toContain(elsewhere.id);
  });
});

describe('fixedLocationSelection', () => {
  it('lists a CQC RM’s own locations, which are kept out of the editable ones', () => {
    const grants = [
      grant({ basis: 'registered_manager', userSource: CQC }),
      grant({ locationCode: 'L2' }),
    ];
    expect(fixedLocationSelection(grants, niContext)).toEqual(['L1']);
    expect(currentLocationSelection(grants, niContext)).toEqual(['L2']);
  });
});

describe('legacyFieldsFromGrants', () => {
  const row = (
    scope_type: string,
    location_code: string | null,
    status = 'active'
  ) => ({
    scope_type,
    provider_code: 'P1',
    location_code,
    status,
  });

  it('prefers a provider grant', () => {
    expect(
      legacyFieldsFromGrants([row('provider', null), row('location', 'L1')])
    ).toEqual({ locationType: 'Care provider', locationId: 'P1' });
  });

  it('lists live locations and ignores suspended ones', () => {
    expect(
      legacyFieldsFromGrants([
        row('location', 'L1'),
        row('location', 'L2', 'invited'),
        row('location', 'L3', 'suspended'),
      ])
    ).toEqual({ locationType: 'Care provider location', locationId: 'L1,L2' });
  });

  it('is null when nothing is left', () => {
    expect(legacyFieldsFromGrants([row('location', 'L1', 'suspended')])).toBe(
      null
    );
  });
});

describe('isFixedGrant', () => {
  it('only holds a CQC NI’s or RM’s access while the register still lists them', () => {
    const cqcRm = { basis: 'registered_manager', userSource: CQC };
    expect(isFixedGrant({ ...cqcRm, status: 'active' })).toBe(true);
    expect(isFixedGrant({ ...cqcRm, status: 'invited' })).toBe(true);
    expect(isFixedGrant({ ...cqcRm, status: 'suspended' })).toBe(false);
    expect(
      isFixedGrant({ basis: 'delegated', userSource: CQC, status: 'active' })
    ).toBe(false);
  });
});

describe('delegatedReaderFields', () => {
  it('re-adds as a delegated reader granted by the approver, never an approver', () => {
    expect(delegatedReaderFields('approver-2', NOW)).toEqual({
      basis: 'delegated',
      role: 'reader',
      source: 'approver',
      granted_by_user_id: 'approver-2',
      granted_at: NOW,
    });
  });
});
