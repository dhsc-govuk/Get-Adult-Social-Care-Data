import { authClient } from '@/lib/auth-client';
import LocationService, {
  AvailableLocation,
} from '@/services/location/locationService';
import { mockSession } from '@/test-utils/test-utils';

global.fetch = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
    getSession: vi.fn(),
  },
}));

const mockUseSession = vi.mocked(authClient.useSession);
const mockGetSession = vi.mocked(authClient.getSession);

mockUseSession.mockReturnValue({ data: mockSession } as any);
mockGetSession.mockResolvedValue({ data: mockSession } as any);

describe('LocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLocations', () => {
    const mockLocations: {} = { la_name: 'Suffolk', la_code: '1' };
    const query = '123';

    it('fetches and returns locations successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockLocations),
      });

      const result = await LocationService.getLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_location_data?provider_location_id=${query}`
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(LocationService.getLocations(query)).rejects.toThrow(
        'Error fetching data: Not Found'
      );
    });
  });

  describe('getAvailableLocations', () => {
    const mockJsonResponse = {
      data: [
        {
          location_id: '1',
          location_name: 'Location A',
        },
        {
          location_id: '2',
          location_name: 'Location B',
        },
      ],
    };
    const mockLocations: AvailableLocation[] = [
      {
        location_id: '1',
        location_name: 'Location A',
      },
      {
        location_id: '2',
        location_name: 'Location B',
      },
    ];
    const query = 'testlocation1';

    it('fetches and returns available locations successfully with a provider id', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockJsonResponse),
      });

      const result = await LocationService.getAvailableLocations();

      expect(fetch).toHaveBeenCalledWith(`/api/get_available_locations`);
      expect(result).toEqual(mockLocations);
    });

    it('fetches and returns available locations successfully without a provider id', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockJsonResponse),
      });

      const result = await LocationService.getAvailableLocations();

      expect(fetch).toHaveBeenCalledWith(`/api/get_available_locations`);
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        LocationService.getAvailableLocations(query)
      ).rejects.toThrow('Error fetching data: Not Found');
    });

    it('throws an error when the request fails', async () => {
      (fetch as vi.Mock).mockResolvedValue(new Error('Network error'));

      await expect(LocationService.getAvailableLocations()).rejects.toThrow(
        'Failed to retrieve available location data: Error fetching data: undefined'
      );
    });

    it('should handle unknown error type in catch block', async () => {
      (fetch as vi.Mock).mockRejectedValueOnce('String error');

      await expect(LocationService.getAvailableLocations()).rejects.toThrow(
        'Failed to retrieve available location data: Unknown error occurred'
      );
    });
  });

  describe('getDefaultCPLocation', () => {
    const providerLocationId: string = '1';
    const locationType: string = 'LA';
    const mockResponse = [{ metric_location_id: '123' }];

    it('fetches and returns la locations successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await LocationService.getDefaultCPLocation(
        providerLocationId,
        locationType
      );

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_available_locations?provider_location_id=${encodeURIComponent(providerLocationId)}&location_type=${encodeURIComponent(locationType)}`
      );
      expect(result).toEqual('123');
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        LocationService.getDefaultCPLocation(providerLocationId, locationType)
      ).rejects.toThrow('Error fetching data: Not Found');
    });
  });

  describe('getLocationNames', () => {
    const mockLocationData = {
      la_name: 'Suffolk',
      region_name: 'East of England',
      country_name: 'United Kingdom',
      provider_location_name: 'Care Provider A',
    };

    const query = '123';

    beforeEach(() => {
      vi.spyOn(LocationService, 'getLocations').mockResolvedValue(
        mockLocationData as any
      );
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await LocationService.getLocationNames(query, false);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        CPLabel: 'N/A',
        CountryLabel: 'United Kingdom',
        IndicatorLabel: 'Indicator',
        LALabel: 'Suffolk',
        RegionLabel: 'East of England',
      });
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await LocationService.getLocationNames(query, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        CPLabel: 'Care Provider A',
        CountryLabel: 'United Kingdom',
        IndicatorLabel: 'Indicator',
        LALabel: 'Suffolk',
        RegionLabel: 'East of England',
      });
    });
  });

  describe('getLocationIds', () => {
    const mockLocationData = {
      la_code: 'Suffolk',
      region_code: 'East of England',
      country_code: 'United Kingdom',
      provider_location_id: 'ABC',
    };

    const query = '123';

    beforeEach(() => {
      vi.spyOn(LocationService, 'getLocations').mockResolvedValue(
        mockLocationData as any
      );
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await LocationService.getLocationIds(query, false);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await LocationService.getLocationIds(query, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'ABC',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });
  });

  describe('getLasForRegion', () => {
    const mockLocations: {} = [
      { la_name: 'Suffolk', la_code: '1' },
      { la_name: 'Manchester', la_code: '2' },
    ];
    const query = '123';

    it('fetches and returns las successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockLocations),
      });

      const result = await LocationService.getLasForRegion(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_las_for_region?region_code=${query}`
      );
      expect(result).toEqual(mockLocations);
    });
  });
});
