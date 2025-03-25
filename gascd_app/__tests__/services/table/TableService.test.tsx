import TableService from '@/services/Table/TableService';
import { Indicator } from '@/data/interfaces/Indicator';

describe('TableService', () => {
  const mockData: Indicator[] = [
    {
      metric_id: '1',
      location_id: '1',
      data_point: 10,
      metric_date_type: '',
      metric_date: new Date(2024, 3, 1),
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 3, 10),
    },
    {
      metric_id: '1',
      location_id: '1',
      data_point: 20,
      metric_date_type: '',
      metric_date: new Date(2024, 3, 5),
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 3, 11),
    },
    {
      metric_id: '2',
      location_id: '2',
      data_point: 30,
      metric_date_type: '',
      metric_date: new Date(2024, 2, 15),
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 2, 20),
    },
  ];

  describe('filterDate', () => {
    it('should return only the latest entry for each metric-location pair', () => {
      const result: Indicator[] = TableService.filterDate(mockData);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          metric_id: '1',
          location_id: '1',
          data_point: 20,
          metric_date_type: '',
          metric_date: new Date(2024, 3, 5),
          location_type: '',
          numerator: 0,
          multiplier: 0,
          denominator: 0,
          load_date_time: new Date(2024, 3, 11),
        },
        {
          metric_id: '2',
          location_id: '2',
          data_point: 30,
          metric_date_type: '',
          metric_date: new Date(2024, 2, 15),
          location_type: '',
          numerator: 0,
          multiplier: 0,
          denominator: 0,
          load_date_time: new Date(2024, 2, 20),
        },
      ]);
    });
  });

  describe('removeLoadDateTime', () => {
    it('should return data without the load_date_time field', () => {
      const result = TableService.removeLoadDateTime(mockData);
      expect(result).toHaveLength(3);
      result.forEach((item: Omit<Indicator, 'load_date_time'>) => {
        expect(item).not.toHaveProperty('load_date_time');
      });
    });
  });
});
