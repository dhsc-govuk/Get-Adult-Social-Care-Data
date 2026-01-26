import { Indicator } from '@/data/interfaces/Indicator';

interface SeriesPoint {
  date: string;
  value: number;
}

export const transformSeriesData = (
  series_start_date: string,
  series_frequency: string,
  values: number[]
): SeriesPoint[] => {
  if (series_frequency === 'Daily') {
    return values.map((val, index) => {
      const date = new Date(series_start_date);

      // Add 'index' number of days to the start date
      date.setDate(date.getDate() + index);

      return {
        date: date.toISOString().split('T')[0], // Returns 'YYYY-MM-DD'
        value: val,
      };
    });
  } else {
    throw new Error('Unknown series frequency: ' + series_frequency);
  }
};
