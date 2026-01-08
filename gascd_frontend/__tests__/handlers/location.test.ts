import { NextResponse } from 'next/server';
import { GET as GetLocalAuthority } from '../../app/api/get_local_authority/route';
import { GET as GetCareProviderLocation } from '../../app/api/get_care_provider/route';
import { GET as GetRegion } from '../../app/api/get_region/route';
import { locations_data } from '@/data/mockResponses/locations_data';

const { server } = await import('@/mocks/node');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('test handlers', () => {
  it('fetches and returns care provider locations successfully', async () => {
    const query = 'testcpl1';
    const mockCPLocation: {} = locations_data.care_provider_location;

    const req = {
      url: `http://localhost/api/get_care_provider?cp_code=${query}`,
    };

    const result = await GetCareProviderLocation(req);
    const data = await result.json();

    expect(data).toEqual(mockCPLocation);
  });

  it('fetches and returns local authority successfully', async () => {
    const query = 'E08000024';
    const mockLocalAuthority: {} = locations_data.local_authority;

    const req = {
      url: `http://localhost/api/get_local_authority?la_code=${query}`,
    };

    const result = await GetLocalAuthority(req);
    const data = await result.json();

    expect(data).toEqual(mockLocalAuthority);
  });

  it('fetches and returns regions successfully', async () => {
    const query = 'E12000001';
    const mockRegion: {} = locations_data.region;

    const req = { url: `http://localhost/api/get_region?region_code=${query}` };

    const result = await GetRegion(req);
    const data = await result.json();

    expect(data).toEqual(mockRegion);
  });
});
