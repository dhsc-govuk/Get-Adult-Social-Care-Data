import { Indicator } from '@/data/interfaces/Indicator';

class TableService {
  public static filterDate(data: Indicator[]): Indicator[] {
    const latestEntries: Record<string, any> = {};
    data.forEach((entry) => {
      const { metric_id, location_id, metric_date } = entry;
      const key = `${metric_id}-${location_id}`;

      if (
        !latestEntries[key] ||
        new Date(entry.metric_date) > new Date(latestEntries[key].metric_date)
      ) {
        latestEntries[key] = entry;
      }
    });
    return Object.values(latestEntries);
  }

  public static removeLoadDateTime(
    data: Indicator[]
  ): Omit<Indicator, 'load_date_time'>[] {
    return data.map(({ load_date_time, ...rest }) => rest);
  }
}

export default TableService;
