import {
  CodeLookup,
  ImportRow,
  auditRowFor,
  codesToLookUp,
  grantsForRow,
  lookUpCodes,
  splitCodes,
  unknownCodes,
} from '../../scripts/importUserGrants';

const now = new Date('2026-10-29T12:00:00Z');

const lookup: CodeLookup = {
  providerCodes: new Set(['P1', 'P2']),
  locationProviderCodes: new Map([
    ['L1', 'P1'],
    ['L2', 'P2'],
  ]),
  laCodes: new Set(['E09000003']),
};

const row = (location_type: string, location_id: string): ImportRow => ({
  name: 'Test Person',
  email: 'test.person@example.org',
  location_type,
  location_id,
});

describe('splitCodes', () => {
  it('trims, drops blanks and duplicates', () => {
    expect(splitCodes(' P1, P2,,P1 ')).toEqual(['P1', 'P2']);
    expect(splitCodes(null)).toEqual([]);
  });
});

describe('codesToLookUp', () => {
  it('groups codes by the table they must be found in', () => {
    expect(
      codesToLookUp([
        row('Care provider', 'P1,P2'),
        row('Care provider location', 'L1'),
        row('LA', 'E09000003'),
        row('Unknown type', 'X1'),
      ])
    ).toEqual({ provider: ['P1', 'P2'], location: ['L1'], la: ['E09000003'] });
  });
});

describe('unknownCodes', () => {
  it('checks each code against the table for its location type', () => {
    expect(unknownCodes(row('Care provider', 'P1,P9'), lookup)).toEqual(['P9']);
    // A location code is not a provider code, even if it exists
    expect(unknownCodes(row('Care provider', 'L1'), lookup)).toEqual(['L1']);
    expect(unknownCodes(row('Care provider location', 'L1'), lookup)).toEqual(
      []
    );
    expect(unknownCodes(row('LA', 'E00000000'), lookup)).toEqual(['E00000000']);
  });
});

describe('grantsForRow', () => {
  it('gives a Nominated Individual an approver grant per provider', () => {
    const grants = grantsForRow(
      'u1',
      row('Care provider', 'P1,P2'),
      lookup,
      now
    );
    expect(grants).toHaveLength(2);
    expect(grants[0]).toEqual({
      user_id: 'u1',
      scope_type: 'provider',
      provider_code: 'P1',
      location_code: null,
      la_code: null,
      role: 'approver',
      basis: 'nominated_individual',
      status: 'invited',
      source: 'admin',
      granted_at: now,
    });
  });

  it("gives a Registered Manager a location grant with the location's provider", () => {
    const [grant] = grantsForRow(
      'u1',
      row('Care provider location', 'L2'),
      lookup,
      now
    );
    expect(grant).toMatchObject({
      scope_type: 'location',
      provider_code: 'P2',
      location_code: 'L2',
      role: 'approver',
      basis: 'registered_manager',
    });
  });

  it('gives an LA user a reader grant on the LA', () => {
    const [grant] = grantsForRow('u1', row('LA', 'E09000003'), lookup, now);
    expect(grant).toMatchObject({
      scope_type: 'local_authority',
      provider_code: null,
      la_code: 'E09000003',
      role: 'reader',
      basis: 'la_user',
    });
  });

  it("refuses a location gascd_data doesn't have", () => {
    expect(() =>
      grantsForRow('u1', row('Care provider location', 'L9'), lookup, now)
    ).toThrow('L9');
  });
});

describe('auditRowFor', () => {
  it('records who imported the user and what they were given', () => {
    const imported = row('Care provider location', 'L1');
    const grants = grantsForRow('u1', imported, lookup, now);
    const audit = auditRowFor('u1', imported, grants, 'kevin-wong-edge', now);
    expect(audit).toMatchObject({
      action: 'user_added',
      actor_type: 'admin',
      actor_name: 'kevin-wong-edge',
      target_user_id: 'u1',
      target_email: 'test.person@example.org',
      provider_code: 'P1',
      location_codes: 'L1',
    });
    expect(JSON.parse(audit.details)).toMatchObject({
      source: 'import_users',
      basis: 'registered_manager',
      codes: ['L1'],
    });
  });
});

describe('lookUpCodes', () => {
  it('maps each location to its provider through care_provider_fk', async () => {
    const query = vi.fn(async (text: string, _values: unknown[]) => {
      if (text.includes('care_provider_locations')) {
        return { rows: [{ code: 'L1', provider_code: 'P1' }] };
      }
      if (text.includes('local_authorities')) {
        return { rows: [{ code: 'E09000003' }] };
      }
      return { rows: [{ code: 'P1' }] };
    });

    const result = await lookUpCodes(
      { query },
      { provider: ['P1'], location: ['L1'], la: ['E09000003'] }
    );

    expect(result.locationProviderCodes.get('L1')).toBe('P1');
    expect(result.providerCodes.has('P1')).toBe(true);
    expect(result.laCodes.has('E09000003')).toBe(true);
    expect(query.mock.calls[1][0]).toContain(
      'JOIN public.care_providers p ON p.id = l.care_provider_fk'
    );
    expect(query.mock.calls[1][1]).toEqual([['L1']]);
  });
});
