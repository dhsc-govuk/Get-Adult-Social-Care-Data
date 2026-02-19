import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

global.fetch = vi.fn();

describe('IndicatorFetchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      const query: IndicatorQuery = {
        metric_ids: ['mymetric'],
        location_ids: [],
      };
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

      const query: IndicatorQuery = {
        metric_ids: ['mymetric'],
        location_ids: [],
      };
      await expect(IndicatorFetchService.getData(query)).rejects.toThrow(
        'Failed to fetch data: Service Unavailable'
      );
    });
  });
});
