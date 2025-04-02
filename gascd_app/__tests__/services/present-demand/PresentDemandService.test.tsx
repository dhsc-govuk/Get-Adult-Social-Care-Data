import PresentDemandService from '@/services/present-demand/presentDemandService';
import { Location } from '@/data/interfaces/Location';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorDisplayService from '@/services/indicator/IndicatorDisplayService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';

global.fetch = jest.fn();

describe('IndicatorFetchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocations', () => {
    const mockLocations: {} = { la_name: 'Suffolk', la_code: '1' };
    const query = '123';

    it('fetches and returns locations successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLocations),
      });

      const result = await PresentDemandService.getLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_location_data?provider_location_id=${query}`
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(PresentDemandService.getLocations(query)).rejects.toThrow(
        'Error fetching data: Not Found'
      );
    });
  });

  describe('getLaLocations', () => {
    const mockLocations: {} = { la_name: 'Suffolk', la_code: '1' };
    const query = '123';

    it('fetches and returns la locations successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLocations),
      });

      const result = await PresentDemandService.getLaLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `/api/get_la_location_data?la_code=${query}`
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(PresentDemandService.getLaLocations(query)).rejects.toThrow(
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
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLocations),
      });

      const result = await PresentDemandService.getAvailableLocations(query);

      expect(fetch).toHaveBeenCalledWith(
        `api/get_available_locations?provider_location_id=${query}`
      );
      expect(result).toEqual(mockLocations);
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        PresentDemandService.getAvailableLocations(query)
      ).rejects.toThrow('Error fetching data: Not Found');
    });
  });
  describe('getDefaultCPLocation', () => {
    const providerLocationId: string = '1';
    const locationType: string = 'LA';
    const mockResponse = [{ metric_location_id: '123' }];

    it('fetches and returns la locations successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await PresentDemandService.getDefaultCPLocation(
        providerLocationId,
        locationType
      );

      expect(fetch).toHaveBeenCalledWith(
        `api/get_available_locations?provider_location_id=${encodeURIComponent(providerLocationId)}&location_type=${encodeURIComponent(locationType)}`
      );
      expect(result).toEqual('123');
    });

    it('throws an error when the fetch response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        PresentDemandService.getDefaultCPLocation(
          providerLocationId,
          locationType
        )
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
      jest
        .spyOn(PresentDemandService, 'getLocations')
        .mockResolvedValue(mockLocationData as any);
      jest
        .spyOn(PresentDemandService, 'getLaLocations')
        .mockResolvedValue(mockLocationData as any);
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await PresentDemandService.getLocationNames(
        query,
        false,
        true
      );

      expect(PresentDemandService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Filter',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await PresentDemandService.getLocationNames(
        query,
        true,
        true
      );

      expect(PresentDemandService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Filter',
        'Care Provider A',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand without care provider', async () => {
      const result = await PresentDemandService.getLocationNames(
        query,
        false,
        false
      );

      expect(PresentDemandService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand with care provider', async () => {
      const result = await PresentDemandService.getLocationNames(
        query,
        true,
        false
      );

      expect(PresentDemandService.getLaLocations).toHaveBeenCalledWith(query);
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
      jest
        .spyOn(PresentDemandService, 'getLocations')
        .mockResolvedValue(mockLocationData as any);
      jest
        .spyOn(PresentDemandService, 'getLaLocations')
        .mockResolvedValue(mockLocationData as any);
    });

    it('returns location names for present demand without care provider', async () => {
      const result = await PresentDemandService.getLocationIds(
        query,
        false,
        true
      );

      expect(PresentDemandService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Filter',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for present demand with care provider', async () => {
      const result = await PresentDemandService.getLocationIds(
        query,
        true,
        true
      );

      expect(PresentDemandService.getLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Filter',
        'ABC',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand without care provider', async () => {
      const result = await PresentDemandService.getLocationIds(
        query,
        false,
        false
      );

      expect(PresentDemandService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });

    it('returns location names for LA demand with care provider', async () => {
      const result = await PresentDemandService.getLocationIds(
        query,
        true,
        false
      );

      expect(PresentDemandService.getLaLocations).toHaveBeenCalledWith(query);
      expect(result).toEqual([
        'Location',
        'ABC',
        'Suffolk',
        'East of England',
        'United Kingdom',
      ]);
    });
  });
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = PresentDemandService.formatDate('25/12/2023');
      expect(result).toBe('25 December 2023');
    });

    it('formats single-digit day and month correctly', () => {
      const result = PresentDemandService.formatDate('05/03/2022');
      expect(result).toBe('05 March 2022');
    });

    it('handles invalid date format gracefully', () => {
      expect(() => PresentDemandService.formatDate('invalid')).toThrow();
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
      expect(result).toBe(
        'Fri Jun 30 2023 00:00:00 GMT+0100 (British Summer Time)'
      );
    });

    it('returns an empty string when given an empty array', () => {
      const result = PresentDemandService.getMostRecentIndicator([]);
      expect(result).toBe('');
    });

    it('handles a single-entry array correctly', () => {
      const singleEntry = [mockIndicators[1]];
      const result = PresentDemandService.getMostRecentIndicator(singleEntry);
      expect(result).toBe(
        'Mon May 15 2023 00:00:00 GMT+0100 (British Summer Time)'
      );
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
      jest
        .spyOn(PresentDemandService, 'formatDate')
        .mockImplementation((date) => `Formatted: ${date}`);
    });

    it('returns the formatted most recent date', () => {
      const result = PresentDemandService.getMostRecentDate(mockIndicators);
      expect(PresentDemandService.formatDate).toHaveBeenCalledWith(
        'Fri Jun 30 2023 00:00:00 GMT+0100 (British Summer Time)'
      );
      expect(result).toBe(
        'Formatted: Fri Jun 30 2023 00:00:00 GMT+0100 (British Summer Time)'
      );
    });

    it('returns an empty string when given an empty array', () => {
      const result = PresentDemandService.getMostRecentDate([]);
      expect(result).toBe('Formatted: ');
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

    let getDisplayDataSpy: jest.SpyInstance;
    let getSourceSpy: jest.SpyInstance;

    beforeEach(() => {
      getDisplayDataSpy = jest.spyOn(IndicatorFetchService, 'getDisplayData');
      getSourceSpy = jest.spyOn(IndicatorDisplayService, 'getSource');
    });

    afterEach(() => {
      jest.restoreAllMocks();
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
