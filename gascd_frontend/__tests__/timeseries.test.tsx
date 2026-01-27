import { transformSeriesData } from '@/utils/timeseries';

describe('transformSeriesData', () => {
  it('should correctly map daily values to consecutive dates', () => {
    const series_start_date = '2025-01-01';
    const series_end_date = '2025-01-03';
    const series_frequency = 'Daily';
    const values = [10, 20, 30];

    const result = transformSeriesData(
      series_start_date,
      series_end_date,
      series_frequency,
      values
    );

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2025-01-01', value: 10 });
    expect(result[1]).toEqual({ date: '2025-01-02', value: 20 });
    expect(result[2]).toEqual({ date: '2025-01-03', value: 30 });
  });

  it('should handle month and year rollovers correctly', () => {
    const input = {
      series_start_date: '2025-12-31',
      series_end_date: '2026-01-02',
      series_frequency: 'Daily',
      values: [100, 200, 300],
    };

    const result = transformSeriesData(
      input.series_start_date,
      input.series_end_date,
      input.series_frequency,
      input.values
    );

    expect(result[0].date).toBe('2025-12-31');
    expect(result[1].date).toBe('2026-01-01'); // Happy New Year!
  });

  it('should handle leap years correctly', () => {
    const input = {
      series_start_date: '2024-02-28', // 2024 was a leap year
      series_end_date: '2024-03-01',
      series_frequency: 'Daily',
      values: [1, 2, 3],
    };

    const result = transformSeriesData(
      input.series_start_date,
      input.series_end_date,
      input.series_frequency,
      input.values
    );

    expect(result[1].date).toBe('2024-02-29');
    expect(result[2].date).toBe('2024-03-01');
  });

  it('should throw an error if the values do not match the series start/end', () => {
    const input = {
      series_start_date: '2025-01-01',
      series_end_date: '2025-01-07',
      series_frequency: 'Daily',
      values: [1],
    };

    const error_func = () => {
      transformSeriesData(
        input.series_start_date,
        input.series_end_date,
        input.series_frequency,
        input.values
      );
    };
    expect(error_func).toThrow(
      'Data mismatch: Expected 7 values for the date range, but received 1.'
    );
  });

  it('should return an empty array if frequency is not daily', () => {
    const input = {
      series_start_date: '2025-01-01',
      series_end_date: '2025-01-01',
      series_frequency: 'Monthly',
      values: [1, 2, 3],
    };

    const error_func = () => {
      transformSeriesData(
        input.series_start_date,
        input.series_end_date,
        input.series_frequency,
        input.values
      );
    };
    expect(error_func).toThrow('Unknown series frequency: Monthly');
  });
});
