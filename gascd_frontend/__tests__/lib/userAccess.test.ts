import { describe, expect, it } from 'vitest';
import {
  AccessGrantScope,
  accessFromGrants,
  locationFieldsFromAccess,
} from '@/lib/userAccess';

const NOW = new Date('2026-10-27T12:00:00Z');

const grant = (overrides: Partial<AccessGrantScope>): AccessGrantScope => ({
  scope_type: 'location',
  provider_code: 'P1',
  location_code: 'L1',
  la_code: null,
  status: 'active',
  expires_at: null,
  ...overrides,
});

describe('accessFromGrants', () => {
  it('collects providers, locations and LAs from live grants', () => {
    expect(
      accessFromGrants(
        [
          grant({ scope_type: 'provider', location_code: null }),
          grant({ location_code: 'L1' }),
          grant({ location_code: 'L2', status: 'invited' }),
          grant({ location_code: 'L2' }),
        ],
        NOW
      )
    ).toEqual({
      providerCodes: ['P1'],
      locationCodes: ['L1', 'L2'],
      laCodes: [],
    });
  });

  it('ignores suspended and expired grants', () => {
    expect(
      accessFromGrants(
        [
          grant({ status: 'suspended' }),
          grant({ location_code: 'L2', expires_at: '2026-10-01T00:00:00Z' }),
          grant({ location_code: 'L3', expires_at: '2026-11-01T00:00:00Z' }),
        ],
        NOW
      )
    ).toEqual({ providerCodes: [], locationCodes: ['L3'], laCodes: [] });
  });

  it('reads LA grants', () => {
    expect(
      accessFromGrants(
        [
          grant({
            scope_type: 'local_authority',
            provider_code: null,
            location_code: null,
            la_code: 'E09000003',
          }),
        ],
        NOW
      ).laCodes
    ).toEqual(['E09000003']);
  });
});

describe('locationFieldsFromAccess', () => {
  it('gives LA users the LA type', () => {
    expect(
      locationFieldsFromAccess({
        providerCodes: [],
        locationCodes: [],
        laCodes: ['E1'],
      })
    ).toEqual({ locationType: 'LA', locationId: 'E1' });
  });

  it('treats any provider-wide grant as a care provider user', () => {
    expect(
      locationFieldsFromAccess({
        providerCodes: ['P1'],
        locationCodes: ['L9'],
        laCodes: [],
      })
    ).toEqual({ locationType: 'Care provider', locationId: 'P1,L9' });
  });

  it('gives location-only users the location type', () => {
    expect(
      locationFieldsFromAccess({
        providerCodes: [],
        locationCodes: ['L1', 'L2'],
        laCodes: [],
      })
    ).toEqual({ locationType: 'Care provider location', locationId: 'L1,L2' });
  });

  it('gives no type when there is no access', () => {
    expect(
      locationFieldsFromAccess({
        providerCodes: [],
        locationCodes: [],
        laCodes: [],
      })
    ).toEqual({ locationType: null, locationId: null });
  });
});
