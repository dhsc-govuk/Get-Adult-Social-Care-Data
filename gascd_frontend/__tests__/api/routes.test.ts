import { NextRequest, NextResponse } from 'next/server';
import { locations_data } from '@/data/mockResponses/locations_data';
import { GET as GetFilters } from '../../app/api/get_all_total_beds_filters/route';
import { GET as GetAvailableLocations } from '../../app/api/get_available_locations/route';
import { POST as SetSelectedLocation } from '../../app/api/set_selected_location/route';
import {
  mockSession,
  mockSessionCareProvider,
  mockSessionInvalidLocationType,
  mockSessionUnregistered,
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
      },
      {
        checked: false,
        filter_bedtype: 'General nursing',
      },
      {
        checked: false,
        filter_bedtype: 'Learning disability residential',
      },
      {
        checked: false,
        filter_bedtype: 'Mental health residential',
      },
      {
        checked: false,
        filter_bedtype: 'Transitional',
      },
      {
        checked: false,
        filter_bedtype: 'Young physically disabled',
      },
    ];
    expect(data).toEqual(expected_filters);
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
