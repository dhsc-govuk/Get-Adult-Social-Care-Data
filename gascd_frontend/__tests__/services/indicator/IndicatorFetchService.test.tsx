import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { Indicator } from '@/data/interfaces/Indicator';
import { Location } from '@/data/interfaces/Location';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';

global.fetch = vi.fn();

describe('IndicatorFetchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLocations', () => {
    it('fetches and returns locations', async () => {
      const mockLocations: Location[] = [{ la_name: 'London', la_code: '1' }];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockLocations),
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      const result = await IndicatorFetchService.getLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        '/api/get_location_names',
        expect.any(Object)
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      await expect(IndicatorFetchService.getLocations(query)).rejects.toThrow(
        'Failed to fetch data: Internal Server Error'
      );
    });
  });

  describe('getLocalAuthoritiesInProviderLocationRegion', () => {
    it(' fetches data with providerLocationId', async () => {
      const mockData = [{ id: '1', name: 'Region A' }];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result =
        await IndicatorFetchService.getLocalAuthoritiesInProviderLocationRegion(
          '123'
        );

      expect(fetch).toHaveBeenCalledWith(
        '/api/get_locations',
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });

    it('sends an empty request body when providerLocationId is undefined', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([{ id: '1', name: 'Location A' }]),
      });

      await IndicatorFetchService.getLocalAuthoritiesInProviderLocationRegion(
        undefined
      );

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/get_locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    });

    it(' throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        IndicatorFetchService.getLocalAuthoritiesInProviderLocationRegion('123')
      ).rejects.toThrow('Failed to fetch data: Bad Request');
    });
  });

  describe('getFilters', () => {
    it('fetches and sorts filter data', async () => {
      const mockFilters: TotalBedsFilters[] = [
        { metric_id: '2', filter_bedtype: 'Nursing', checked: false },
        { metric_id: '1', filter_bedtype: 'General', checked: false },
      ];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockFilters),
      });

      const result = await IndicatorFetchService.getFilters('metric1');

      expect(fetch).toHaveBeenCalledWith('/api/get_all_total_beds_filters');
      expect(result).toEqual([
        { metric_id: '1', filter_bedtype: 'General', checked: false },
        { metric_id: '2', filter_bedtype: 'Nursing', checked: false },
      ]);
    });

    it('throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(IndicatorFetchService.getFilters('metric1')).rejects.toThrow(
        'Failed to fetch data: Not Found'
      );
    });
  });

  describe('getData', () => {
    it('fetches and returns indicators', async () => {
      const mockData: Indicator[] = [
        {
          metric_id: '1',
          metric_date_type: '',
          metric_date: new Date(),
          location_type: '',
          location_id: '',
          numerator: 0,
          multiplier: 0,
          denominator: 0,
          data_point: 0,
          load_date_time: new Date(),
        },
      ];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      const result = await IndicatorFetchService.getData(query);

      expect(fetch).toHaveBeenCalledWith(
        '/api/get_metric_data',
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });

    it('throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Service Unavailable',
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      await expect(IndicatorFetchService.getData(query)).rejects.toThrow(
        'Failed to fetch data: Service Unavailable'
      );
    });
  });

  describe('getMetadateByType', () => {
    it('fetches and returns metadata', async () => {
      const mockMetadata: IndicatorDisplay[] = [
        {
          data_source: 'ONS',
          theme: '',
          category: '',
          group_id: '',
          metric_id: '',
          group: '',
          metric_name: '',
          description: '',
          numerator: '',
          denominator: '',
          mirrored: '',
          filter_age: '',
          filter_support_type: '',
          filter_support_setting: '',
          filter_disabilty_status: '',
          filter_care_provider_type: '',
          filter_bedtype: '',
          metric_type: '',
          aggreation: '',
          graph: '',
          comments: '',
        },
      ];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockMetadata),
      });

      const result = await IndicatorFetchService.getMetadateByType('testType');

      expect(fetch).toHaveBeenCalledWith(
        '/api/get_metadata_by_data_types?metric_data_type=testType'
      );
      expect(result).toEqual(mockMetadata);
    });

    it('throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(
        IndicatorFetchService.getMetadateByType('testType')
      ).rejects.toThrow('Failed to fetch data: Forbidden');
    });
  });

  describe('getDisplayData', () => {
    it('fetches and returns display data', async () => {
      const mockDisplayData: IndicatorDisplay[] = [
        {
          data_source: 'ONS',
          theme: '',
          category: '',
          group_id: '',
          metric_id: '',
          group: '',
          metric_name: '',
          description: '',
          numerator: '',
          denominator: '',
          mirrored: '',
          filter_age: '',
          filter_support_type: '',
          filter_support_setting: '',
          filter_disabilty_status: '',
          filter_care_provider_type: '',
          filter_bedtype: '',
          metric_type: '',
          aggreation: '',
          graph: '',
          comments: '',
        },
      ];
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDisplayData),
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      const result = await IndicatorFetchService.getDisplayData(query);

      expect(fetch).toHaveBeenCalledWith(
        '/api/get_metadata',
        expect.any(Object)
      );
      expect(result).toEqual(mockDisplayData);
    });

    it('throws error on failed fetch', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      const query: IndicatorQuery = { metric_ids: [], location_ids: [] };
      await expect(IndicatorFetchService.getDisplayData(query)).rejects.toThrow(
        'Failed to fetch data: Unauthorized'
      );
    });
  });
});
