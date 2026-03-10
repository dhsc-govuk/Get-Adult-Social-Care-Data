import { Indicator } from '@/data/interfaces/Indicator';

export interface SeriesPoint {
  date: string;
  value: number;
}

export const transformSeriesData = (
  series_start_date: string,
  series_end_date: string,
  series_frequency: string,
  values: number[]
): SeriesPoint[] => {
  if (series_frequency === 'Daily') {
    const start = new Date(series_start_date + 'T00:00:00');
    const end = new Date(series_end_date + 'T00:00:00');

    // Calculate difference in days: (End - Start) / (ms * sec * min * hr) + 1
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const expectedLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (values.length !== expectedLength) {
      throw new Error(
        `Data mismatch: Expected ${expectedLength} values for the date range, but received ${values.length}.`
      );
    }

    return values.map((val, index) => {
      const date = new Date(start);

      // Add 'index' number of days to the start date
      date.setDate(date.getDate() + index);

      return {
        date: date.toISOString().split('T')[0], // Returns 'YYYY-MM-DD'
        value: val,
      };
    });
  } else if (series_frequency === 'Yearly') {
    const startYear = parseInt(series_start_date);
    const endYear = parseInt(series_end_date);

    const expectedLength = endYear - startYear + 1;

    if (values.length !== expectedLength) {
      throw new Error(
        `Data mismatch: Expected ${expectedLength} values for the year range, but received ${values.length}.`
      );
    }

    return values.reverse().map((val, index) => {
      const year = endYear - index;
      return {
        date: year.toString(),
        value: val,
      };
    });
  } else if (series_frequency === '5 years') {
    const startYear = parseInt(series_start_date);
    const endYear = parseInt(series_end_date);

    const expectedLength = (endYear - startYear) / 5 + 1;

    if (values.length !== expectedLength) {
      throw new Error(
        `Data mismatch: Expected ${expectedLength} values for the year range, but received ${values.length}.`
      );
    }

    return values.reverse().map((val, index) => {
      const year = endYear - index * 5;
      return {
        date: year.toString(),
        value: val,
      };
    });
  } else {
    throw new Error('Unknown series frequency: ' + series_frequency);
  }
};
