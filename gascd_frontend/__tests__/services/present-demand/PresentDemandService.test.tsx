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

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = PresentDemandService.formatDate('25/12/2023');
      expect(result).toBe('25 December 2023');
    });

    it('formats single-digit day and month correctly', () => {
      const result = PresentDemandService.formatDate('05/03/2022');
      expect(result).toBe('5 March 2022');
    });

    it('handles invalid date format gracefully', () => {
      expect(PresentDemandService.formatDate('invalid')).toBe('invalid');
    });
  });

  describe('getMostRecentIndicator', () => {
    const mockIndicators: Indicator[] = [
      {
        metric_date: new Date(2023, 3, 1),
        location_id: '1',
        metric_id: 'A',
        data_point: 100,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 3, 1),
      },
      {
        metric_date: new Date(2023, 4, 15),
        location_id: '2',
        metric_id: 'B',
        data_point: 200,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 4, 15),
      },
      {
        metric_date: new Date(2023, 5, 30),
        location_id: '3',
        metric_id: 'C',
        data_point: 300,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 5, 30),
      },
    ];
    it('returns the most recent metric date', () => {
      const result =
        PresentDemandService.getMostRecentIndicator(mockIndicators);
      expect(result).toContain('Fri Jun 30 2023 00:00:00');
    });

    it('returns an empty string when given an empty array', () => {
      const result = PresentDemandService.getMostRecentIndicator([]);
      expect(result).toBe('');
    });

    it('handles a single-entry array correctly', () => {
      const singleEntry = [mockIndicators[1]];
      const result = PresentDemandService.getMostRecentIndicator(singleEntry);
      expect(result).toContain('Mon May 15 2023 00:00:00');
    });

    it('handles a limited set of metric ids', () => {
      const result = PresentDemandService.getMostRecentIndicator(
        mockIndicators,
        ['A']
      );
      expect(result).toContain('Apr 01 2023 00:00:00');

      const result2 = PresentDemandService.getMostRecentIndicator(
        mockIndicators,
        ['A', 'C']
      );
      expect(result2).toContain('Jun 30 2023 00:00:00');
    });

    it('handles an empty set of metric ids', () => {
      const result = PresentDemandService.getMostRecentIndicator(
        mockIndicators,
        []
      );
      expect(result).toBe('');
    });
  });

  describe('getMostRecentDate', () => {
    const mockIndicators: Indicator[] = [
      {
        metric_date: new Date(2023, 3, 1),
        location_id: '1',
        metric_id: 'A',
        data_point: 100,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 3, 1),
      },
      {
        metric_date: new Date(2023, 4, 15),
        location_id: '2',
        metric_id: 'B',
        data_point: 200,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 4, 15),
      },
      {
        metric_date: new Date(2023, 5, 30),
        location_id: '3',
        metric_id: 'C',
        data_point: 300,
        metric_date_type: '',
        location_type: '',
        numerator: 0,
        multiplier: 0,
        denominator: 0,
        load_date_time: new Date(2023, 5, 30),
      },
    ];
    beforeEach(() => {
      vi.spyOn(PresentDemandService, 'formatDate').mockImplementation(
        (date) => `Formatted: ${date}`
      );
    });

    it('returns the formatted most recent date', () => {
      const result = PresentDemandService.getMostRecentDate(mockIndicators);
      expect(PresentDemandService.formatDate).toHaveBeenCalledWith(
        expect.stringContaining('Fri Jun 30')
      );
      expect(result).toContain('Formatted: Fri Jun 30 2023 00:00:00');
    });

    it('returns an empty string when given an empty array', () => {
      const result = PresentDemandService.getMostRecentDate([]);
      expect(result).toBe('');
    });

    it('handles a limited set of metric ids', () => {
      const result = PresentDemandService.getMostRecentDate(mockIndicators, [
        'A',
      ]);
      expect(result).toContain('Formatted: Sat Apr 01 2023 00:00:00');

      const result2 = PresentDemandService.getMostRecentDate(mockIndicators, [
        'A',
        'C',
      ]);
      expect(result2).toContain('Formatted: Fri Jun 30 2023 00:00:00');
    });

    it('handles an empty set of metric ids', () => {
      const result = PresentDemandService.getMostRecentDate(mockIndicators, []);
      expect(result).toBe('');
    });
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
