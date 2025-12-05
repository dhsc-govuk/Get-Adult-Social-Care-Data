import { Indicator } from '@/data/interfaces/Indicator';
import IndicatorService from '../indicator/IndicatorService';

class TableService {
  public static filterDate(data: Indicator[]): Indicator[] {
    const latestEntries: Record<string, any> = {};
    data.forEach((entry) => {
      const { metric_id, location_id, metric_date } = entry;
      const key = `${metric_id}-${location_id}`;
      if (
        !latestEntries[key] ||
        IndicatorService.parseDate(entry) >
          IndicatorService.parseDate(latestEntries[key])
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

  public static sortData(data: Indicator[]): Record<string, Indicator[]> {
    const filteredData = this.filterDate(data);
    return filteredData.reduce(
      (sortedData, entry) => {
        const { metric_id } = entry;
        if (!sortedData[metric_id]) {
          sortedData[metric_id] = [];
        }
        sortedData[metric_id].push(entry);
        return sortedData;
      },
      {} as Record<string, Indicator[]>
    );
  }
}

export default TableService;
