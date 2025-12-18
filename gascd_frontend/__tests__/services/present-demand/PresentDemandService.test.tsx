import PresentDemandService from '@/services/present-demand/presentDemandService';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorDisplayService from '@/services/indicator/IndicatorDisplayService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';

global.fetch = vi.fn();

describe('PresentDemandService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDataSource', () => {
    const mockDataQuery1: IndicatorQuery = {
      metric_ids: ['metric1', 'metric2'],
      location_ids: ['location1', 'location2'],
    };

    const mockDataQuery2: IndicatorQuery = {
      metric_ids: ['metric3'],
      location_ids: ['location3'],
    };

    let getDisplayDataSpy: vi.SpyInstance;
    let getSourceSpy: vi.SpyInstance;

    beforeEach(() => {
      getDisplayDataSpy = vi.spyOn(IndicatorFetchService, 'getDisplayData');
      getSourceSpy = vi.spyOn(IndicatorDisplayService, 'getSource');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should combine metric_ids and location_ids from both queries and return the source', async () => {
      const mockMetaData = {};
      const mockSource = 'combined-source';

      getDisplayDataSpy.mockResolvedValue(mockMetaData);
      getSourceSpy.mockReturnValue(mockSource);

      const result = await PresentDemandService.getDataSource(
        mockDataQuery1,
        mockDataQuery2
      );

      expect(getDisplayDataSpy).toHaveBeenCalledWith({
        metric_ids: ['metric1', 'metric2', 'metric3'],
        location_ids: ['location1', 'location2', 'location3'],
      });
      expect(getSourceSpy).toHaveBeenCalledWith(mockMetaData);
      expect(result).toBe(mockSource);
    });

    it('should throw an error if getDisplayData fails', async () => {
      getDisplayDataSpy.mockRejectedValue(new Error('Fetch Error'));

      await expect(
        PresentDemandService.getDataSource(mockDataQuery1, mockDataQuery2)
      ).rejects.toThrow('Fetch Error');
    });

    it('should throw an error if getSource fails', async () => {
      const mockMetaData = {};
      getDisplayDataSpy.mockResolvedValue(mockMetaData);
      getSourceSpy.mockRejectedValue(new Error('Source Error'));

      await expect(
        PresentDemandService.getDataSource(mockDataQuery1, mockDataQuery2)
      ).rejects.toThrow('Source Error');
    });
  });
});
