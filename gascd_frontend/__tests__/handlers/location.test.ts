import { NextRequest, NextResponse } from 'next/server';
import { locations_data } from '@/data/mockResponses/locations_data';
import { GET as GetFilters } from '../../app/api/get_all_total_beds_filters/route';

vi.mock('server-only', () => ({
  default: vi.fn(),
}));
vi.mock('../../src/data/dbModule', () => ({
  default: vi.fn(),
}));

const { server } = await import('@/mocks/node');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('test handlers', () => {
  it('fetches and returns filters successfully', async () => {
    const query = 'testcpl1';
    const mockCPLocation: {} = locations_data.care_provider_location;

    const req = {
      url: `http://localhost/api/get_all_total_beds_filters`,
    } as NextRequest;

    const result = await GetFilters(req);
    const data = await result.json();

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
