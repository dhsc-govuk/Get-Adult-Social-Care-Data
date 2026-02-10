import { NextRequest, NextResponse } from 'next/server';
import { locations_data } from '@/data/mockResponses/locations_data';
import { GET as GetFilters } from '../../app/api/get_all_total_beds_filters/route';
import { GET as GetAvailableLocations } from '../../app/api/get_available_locations/route';
import { POST as SetSelectedLocation } from '../../app/api/set_selected_location/route';
import { POST as GetMetricData } from '../../app/api/get_metric_data/route';
import {
  mockSession,
  mockSessionCareProvider,
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
        metric_id: 'bedcount_per_hundred_thousand_adults',
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
  beforeEach(() => vi.clearAllMocks());
  it('throws error if no user', async () => {
    mockGetSession.mockReturnValue(null as any);
    const req = {
      url: `http://localhost/api/get_metric_data`,
    } as NextRequest;

    const result = await GetMetricData(req);
    expect(result.status).toBe(401);
    const data = await result.json();
    expect(data).toEqual({ error: 'No user' });
  });

  it('throws error if no metrics', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest('http://localhost/api/get_metric_data', {
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
    const req = new NextRequest('http://localhost/api/get_metric_data', {
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
    const req = new NextRequest('http://localhost/api/get_metric_data', {
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

  it('passes on valid query type and metrics', async () => {
    mockGetSession.mockReturnValue(mockSessionWithLocation);
    const req = new NextRequest('http://localhost/api/get_metric_data', {
      method: 'POST',
      body: JSON.stringify({
        query_type: 'UserQuery',
        metric_ids: ['valid_but_missing'],
      }),
    });

    const result = await GetMetricData(req);
    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data).toEqual([]);
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

  it('fetches locations user', async () => {
    mockGetSession.mockReturnValue(mockSession);

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
    mockGetSession.mockReturnValue(mockSession);

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
});
