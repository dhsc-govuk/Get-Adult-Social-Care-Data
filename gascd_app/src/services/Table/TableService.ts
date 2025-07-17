import { Indicator } from '@/data/interfaces/Indicator';

class TableService {
  public static parseDate(entry: Indicator) {
    if (entry.metric_date_type == 'string') {
      // expects dd/mm/yyyy
      let dateparts = entry.metric_date.split('/');
      return new Date(
        parseInt(dateparts[2]),
        parseInt(dateparts[1]),
        parseInt(dateparts[0])
      );
    } else {
      return entry.metric_date;
    }
  }

  public static filterDate(data: Indicator[]): Indicator[] {
    const latestEntries: Record<string, any> = {};
    data.forEach((entry) => {
      const { metric_id, location_id, metric_date } = entry;
      const key = `${metric_id}-${location_id}`;
      if (
        !latestEntries[key] ||
        this.parseDate(entry) > this.parseDate(latestEntries[key])
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
