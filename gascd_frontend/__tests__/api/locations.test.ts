import { getDefaultLocations, validateMetricIds } from '@/data/locations';
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

describe('validateMetricIds', () => {
  it('should allow valid alphanumeric IDs with underscores', () => {
    const input = ['my_metric_1', 'Alpha_99', 'simpleID'];
    expect(validateMetricIds(input)).toEqual([
      'my_metric_1',
      'Alpha_99',
      'simpleID',
    ]);
  });

  it('should filter out IDs with special characters or spaces', () => {
    const input = [
      'valid_id',
      'invalid-id',
      'no spaces',
      'id!',
      'drop_table;--',
    ];
    const result = validateMetricIds(input);
    expect(result).toEqual(['valid_id']);
  });

  it('should trim whitespace from IDs', () => {
    const input = ['  trimmed_id  '];
    expect(validateMetricIds(input)).toEqual(['trimmed_id']);
  });

  it('should return an empty array if no IDs are valid', () => {
    const input = ['!!!', '???', ' '];
    expect(validateMetricIds(input)).toEqual([]);
  });
});
