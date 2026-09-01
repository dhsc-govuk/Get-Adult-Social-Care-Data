import { NextRequest, NextResponse } from 'next/server';
import { locations_data } from '@/data/mockResponses/locations_data';
import { GET as GetFilters } from '../../app/api/get_all_total_beds_filters/route';
import { GET as GetCustomGroupValues } from '../../app/api/get_custom_group_values/route';
import { GET as GetLaList } from '../../app/api/get_la_list/route';
import { GET as GetAvailableLocations } from '../../app/api/get_available_locations/route';
import { POST as SetSelectedLocation } from '../../app/api/set_selected_location/route';
import { POST as GetMetricData } from '../../app/api/get_metric_data/route';
import {
  mockSession,
  mockSessionCareProvider,
  mockSessionLAUser,
  mockSessionInvalidLocationType,
  mockSessionUnregistered,
  mockSessionWithLocation,
  mockSessionWithMultipleLocationIDs,
} from '@/test-utils/test-utils';
import { auth, authDB } from '@/lib/auth';
import { organisation_data } from '@/data/mockResponses/organisation_data';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authDB: {
    updateTable: vi.fn(),
  },
}));
const mockGetSession = vi.mocked(auth.api.getSession);
const mockUpdateTable = vi.spyOn(authDB, 'updateTable').mockReturnValue({
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue({ numUpdatedRows: 1n }),
} as any);

vi.mock('server-only', () => ({
  default: vi.fn(),
}));

const { server } = await import('@/mocks/node');

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('test handlers', () => {
  beforeEach(() => vi.clearAllMocks());
  it('fetches and returns filters successfully', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const query = 'testcpl1';
    const mockCPLocation: {} = locations_data.care_provider_location;

    const req = {
      url: `http://localhost/api/get_all_total_beds_filters`,
    } as NextRequest;

    const result = await GetFilters(req);
    const data = await result?.json();

    const expected_filters = [
      {
        checked: false,
        filter_bedtype: 'All bed types',
        metric_id: 'bedcount_per_hundred_thousand_adults_total',
      },
      {
        checked: false,
        filter_bedtype: 'General nursing',
        metric_id: 'bedcount_per_hundred_thousand_adults_total_general_nursing',
      },
      {
        checked: false,
        filter_bedtype: 'Learning disability residential',
        metric_id:
          'bedcount_per_hundred_thousand_adults_total_learning_disability_residential',
      },
      {
        checked: false,
        filter_bedtype: 'Mental health residential',
        metric_id:
          'bedcount_per_hundred_thousand_adults_total_mental_health_residential',
      },
      {
        checked: false,
        filter_bedtype: 'Transitional',
        metric_id: 'bedcount_per_hundred_thousand_adults_total_transitional',
      },
      {
        checked: false,
        filter_bedtype: 'Young physically disabled',
        metric_id:
          'bedcount_per_hundred_thousand_adults_total_ypd_young_physically_disabled',
      },
      {
        checked: false,
        filter_bedtype: 'Community care bed',
        metric_id: 'bedcount_per_hundred_thousand_adults_community_care',
      },
      {
        checked: false,
        filter_bedtype: 'Dementia nursing',
        metric_id: 'bedcount_per_hundred_thousand_adults_dementia_nursing',
      },
      {
        checked: false,
        filter_bedtype: 'Dementia residential',
        metric_id: 'bedcount_per_hundred_thousand_adults_dementia_residential',
      },
      {
        checked: false,
        filter_bedtype: 'General residential',
        metric_id: 'bedcount_per_hundred_thousand_adults_general_residential',
      },
      {
        checked: false,
        filter_bedtype: 'Mental health nursing',
        metric_id: 'bedcount_per_hundred_thousand_adults_mental_health_nursing',
      },
      {
        checked: false,
        filter_bedtype: 'Learning disability nursing',
        metric_id:
          'bedcount_per_hundred_thousand_adults_learning_disability_nursing',
      },
    ];
    expect(data).toEqual(expected_filters);
  });
});

describe('test get metrics', () => {
  const get_metric_url = 'http://localhost/api/get_metric_data';

  beforeEach(() => vi.clearAllMocks());
  it('throws error if no user', async () => {
    mockGetSession.mockReturnValue(null as any);
    const req = {
      url: get_metric_url,
    } as NextRequest;

    const result = await GetMetricData(req);
    expect(result.status).toBe(401);
    const data = await result.json();
    expect(data).toEqual({ error: 'No user' });
  });

  it('throws error if no metrics', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({ query_type: 'UserQuery' }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(400);
    const data = await result.json();
    expect(data).toEqual({ error: 'No metric ids' });
  });

  it('throws error if no metrics', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'NotAQuery',
        metric_ids: ['mymetric'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(400);
    const data = await result.json();
    expect(data).toEqual({ error: 'Unsupported metric query type: NotAQuery' });
  });

  it('throws error if metric ids are invalid', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'UserQuery',
        metric_ids: ['invalid.metric'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(400);
    const data = await result.json();
    expect(data).toEqual({ error: 'No metric ids' });
  });

  it('passes on user query type and metrics', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'UserQuery',
        metric_ids: ['bedcount_total'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(200);
    const data = await result.json();

    // This should match the user's CP and associated location
    const expected_data = [
      {
        data_point: '150',
        location_id: 'testcpl1',
        location_type: 'CareProviderLocation',
        metric_date: '2024-01-05',
        metric_id: 'bedcount_total',
      },
      {
        data_point: '150',
        location_id: 'E08000024',
        location_type: 'LA',
        metric_date: '2024-01-05',
        metric_id: 'bedcount_total',
      },
      {
        data_point: '150',
        location_id: 'E12000001',
        location_type: 'Regional',
        metric_date: '2024-01-05',
        metric_id: 'bedcount_total',
      },
      {
        data_point: '150',
        location_id: 'E92000001',
        location_type: 'National',
        metric_date: '2024-01-05',
        metric_id: 'bedcount_total',
      },
    ];

    expect(data).toEqual(expected_data);
  });

  it('throws error if metric ids are not allowed for this user', async () => {
    mockGetSession.mockReturnValue(mockSessionCareProvider);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'UserQuery',
        metric_ids: ['pansi_metric_one', 'something_else'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(401);
    const data = await result.json();
    expect(data).toEqual({ error: 'Metric access disallowed' });
  });

  it('passes metric ids are allowed for this user', async () => {
    mockGetSession.mockReturnValue(mockSessionLAUser);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'UserQuery',
        metric_ids: ['pansi_metric_one', 'something_else'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    // Returns the expected metrics
    for (let item of data) {
      expect(['pansi_metric_one', 'something_else']).toContain(item.metric_id);
    }
  });

  it('supports time series queries', async () => {
    mockGetSession.mockReturnValue(mockSessionLAUser);
    const req = new NextRequest(get_metric_url, {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'LATimeseriesQuery',
        metric_ids: ['my_metric'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    const data_points = data.map((item: any) => item.data_point);
    expect(data_points).toEqual(['100', '200', '300', '200', '150']);
  });
});

describe('test available locations', () => {
  beforeEach(() => vi.clearAllMocks());
  it('fetches throws error if no user', async () => {
    mockGetSession.mockReturnValue(null as any);
    const req = {
      url: `http://localhost/api/get_available_locations`,
    } as NextRequest;

    const result = await GetAvailableLocations(req);
    const data = await result.json();
    expect(data).toEqual({ error: 'No user' });
  });

  it('fetches locations for user with locationType "Care provider location"', async () => {
    mockGetSession.mockReturnValue(mockSession);

    const req = {
      url: `http://localhost/api/get_available_locations`,
    } as NextRequest;

    const result = await GetAvailableLocations(req);
    const data = await result.json();

    const { care_provider_location } = locations_data;
    const location_listing = {
      location_id: care_provider_location.code,
      location_name: care_provider_location.provider_location_name,
      provider_name: care_provider_location.provider_name,
      la_name: care_provider_location.local_authority_name,
      location_display_name:
        care_provider_location.provider_location_name +
        ` (${care_provider_location.local_authority_name})`,
      location_category: care_provider_location.location_category,
      address: care_provider_location.address,
    };

    expect(data).toEqual({ data: [location_listing] });
  });

  it('fetches locations for user with locationType "Care provider"', async () => {
    mockGetSession.mockReturnValue(mockSessionCareProvider);

    const req = {
      url: `http://localhost/api/get_available_locations`,
    } as NextRequest;

    const result = await GetAvailableLocations(req);
    const data = await result.json();

    const location_listing = organisation_data.locations.map((item) => {
      return {
        location_id: item.location_code,
        location_name: item.location_name,
        provider_name: organisation_data.display_name,
        la_name: item.la_name,
        location_display_name: item.location_name + ` (${item.la_name})`,
        location_category: item.location_category,
        address: item.address,
      };
    });
    expect(data).toEqual({ data: location_listing });
  });
});

describe('set selected locations', () => {
  beforeEach(() => vi.clearAllMocks());
  it('requires a user', async () => {
    mockGetSession.mockReturnValue(mockSessionUnregistered);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(401);
    const data = await result.json();
    expect(data.error).toBe('No user');
  });

  it('requires a location id', async () => {
    mockGetSession.mockReturnValue(mockSession);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(400);
    const data = await result.json();
    expect(data.error).toBe('Missing location id');
  });

  it('rejects invalid location ids', async () => {
    mockGetSession.mockReturnValue(mockSession);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'notvalid' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(401);
    const data = await result.json();
    expect(data.error).toBe('Invalid location selected for user: notvalid');
  });

  it('accepts valid location ids', async () => {
    mockGetSession.mockReturnValue(mockSessionCareProvider);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'loc1' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data.status).toBe('OK');
  });

  it('accepts valid location ids and users with multiple orgs', async () => {
    mockGetSession.mockReturnValue(mockSessionWithMultipleLocationIDs);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'loc1' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data.status).toBe('OK');
  });

  it('accepts valid location ids for CP users', async () => {
    mockGetSession.mockReturnValue(mockSessionCareProvider);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'loc1' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data.status).toBe('OK');
  });

  it('blocks unknown user types', async () => {
    mockGetSession.mockReturnValue(mockSessionInvalidLocationType);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'loc1' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(401);
  });

  it('blocks LA users', async () => {
    mockGetSession.mockReturnValue(mockSessionLAUser);

    const req = new NextRequest('http://localhost/api/set_selected_location', {
      method: 'POST',
      body: JSON.stringify({ location_id: 'loc1' }),
    });
    const result = await SetSelectedLocation(req);
    expect(result.status).toBe(401);
  });
});

describe('get la list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires a user', async () => {
    mockGetSession.mockReturnValue(null as any);
    const result = await GetLaList();
    expect(result.status).toBe(401);
  });

  it('returns the full local authority list', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const result = await GetLaList();
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data.local_authorities).toHaveLength(3);
    expect(data.local_authorities[0]).toEqual({
      code: 'testla1',
      display_name: 'Test LA One',
      region_code: 'E12000001',
      region_name: 'North East',
    });
  });
});

describe('get custom group values', () => {
  const base_url = 'http://localhost/api/get_custom_group_values';

  beforeEach(() => vi.clearAllMocks());

  it('requires a user', async () => {
    mockGetSession.mockReturnValue(null as any);
    const req = new NextRequest(
      `${base_url}?la_codes=testla2&metric_code=perc_households_one_person`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(401);
  });

  it('requires la_codes', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const req = new NextRequest(
      `${base_url}?metric_code=perc_households_one_person`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(400);
  });

  it('requires a metric_code', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const req = new NextRequest(`${base_url}?la_codes=testla2`);
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(400);
  });

  it('rejects more than 500 la_codes', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const codes = Array.from(
      { length: 501 },
      (_, index) => `la_codes=code${index}`
    ).join('&');
    const req = new NextRequest(
      `${base_url}?${codes}&metric_code=perc_households_one_person`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(400);
  });

  it('returns group values for a registered user', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const req = new NextRequest(
      `${base_url}?la_codes=testla2&la_codes=testla3&metric_code=perc_households_one_person`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data.group_members).toHaveLength(2);
    expect(data.custom_group_average).toBe(25);
    expect(data.national_average).toBe(15.5);
  });

  it('derives requesting_la_code from the session for LA users, not the client', async () => {
    // The LA user's own authority (testla1) is in the group; the mock data
    // API excludes the requesting LA from the average, so an average without
    // testla1's value proves the code was injected from the session. A
    // client-supplied requesting_la_code must be ignored.
    mockGetSession.mockReturnValue(mockSessionLAUser);
    const req = new NextRequest(
      `${base_url}?la_codes=testla1&la_codes=testla2&la_codes=testla3&metric_code=perc_households_one_person&requesting_la_code=testla3`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    // Average of testla2 (20) and testla3 (30) - testla1 (10) excluded
    expect(data.custom_group_average).toBe(25);
    expect(data.group_members).toHaveLength(3);
  });

  it('does not send a requesting_la_code for care provider users', async () => {
    mockGetSession.mockReturnValue(mockSession);
    const req = new NextRequest(
      `${base_url}?la_codes=testla1&la_codes=testla2&metric_code=perc_households_one_person`
    );
    const result = await GetCustomGroupValues(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    // No exclusion applies - both values are in the average
    expect(data.custom_group_average).toBe(15);
  });
});
