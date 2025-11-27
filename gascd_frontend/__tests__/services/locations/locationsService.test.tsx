import LocationService from '@/services/location/locationService';
import { Indicator } from '@/data/interfaces/Indicator';

global.fetch = vi.fn();

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

  describe('getLaLocations', () => {
    const mockLocations: {} = { la_name: 'Suffolk', la_code: '1' };
    const query = '123';

    it('fetches and returns la locations successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockLocations),
      });

      const result = await LocationService.getLaLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_la_location_data?la_code=${query}`
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(LocationService.getLaLocations(query)).rejects.toThrow(
        'Error fetching data: Not Found'
      );
    });
  });
  describe('getAvailableLocations', () => {
    const mockLocations: Indicator[] = [
      {
        metric_id: '1',
        location_id: '1',
        metric_date: new Date(2024, 3, 1),
        data_point: 100,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2024, 3, 1),
      },
      {
        metric_id: '1',
        location_id: '2',
        metric_date: new Date(2024, 4, 1),
        data_point: 100,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2024, 4, 1),
      },
    ];
    const query = '123';

    it('fetches and returns available locations successfully', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockLocations),
      });

      const result = await LocationService.getAvailableLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_available_locations?provider_location_id=${query}`
      );
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
      vi.spyOn(LocationService, 'getLaLocations').mockResolvedValue(
        mockLocationData as any
      );
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await LocationService.getLocationNames(query, false, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await LocationService.getLocationNames(query, true, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'Care Provider A',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand without care provider', async () => {
      const result = await LocationService.getLocationNames(
        query,
        false,
        false
      );

      expect(LocationService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand with care provider', async () => {
      const result = await LocationService.getLocationNames(query, true, false);

      expect(LocationService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'Care Provider A',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
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
      vi.spyOn(LocationService, 'getLaLocations').mockResolvedValue(
        mockLocationData as any
      );
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await LocationService.getLocationIds(query, false, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await LocationService.getLocationIds(query, true, true);

      expect(LocationService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Indicator',
        'ABC',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand without care provider', async () => {
      const result = await LocationService.getLocationIds(query, false, false);

      expect(LocationService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand with care provider', async () => {
      const result = await LocationService.getLocationIds(query, true, false);

      expect(LocationService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'ABC',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });
  });
});
