import { getDefaultLocations } from '@/data/locations';
import {
  mockSessionWithLocationCareProvider,
  mockSessionUnregistered,
  mockSessionWithLocation,
} from '@/test-utils/test-utils';

vi.mock('server-only', () => ({
  default: vi.fn(),
}));

const { server } = await import('@/mocks/node');

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const expected_locations = [
  {
    location_code: 'testcpl1',
    location_type: 'CareProviderLocation',
  },
  {
    location_code: 'E08000024',
    location_type: 'LA',
  },
  {
    location_code: 'E12000001',
    location_type: 'Regional',
  },
  {
    location_code: 'E92000001',
    location_type: 'National',
  },
];

describe('getDefaultLocations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return locations for a valid user', async () => {
    const locations = await getDefaultLocations(mockSessionWithLocation.user);
    expect(locations).toStrictEqual(expected_locations);
  });

  it('should return locations for a valid CP user', async () => {
    const locations = await getDefaultLocations(
      mockSessionWithLocationCareProvider.user
    );
    expect(locations).toStrictEqual(expected_locations);
  });

  it('should return no locations for unregistered user', async () => {
    const locations = await getDefaultLocations(mockSessionUnregistered.user);
    expect(locations).toStrictEqual([]);
  });
});
