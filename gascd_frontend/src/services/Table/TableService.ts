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

  // Percentages always show 1 decimal place, currency shows whole pounds,
  // and other values only show a decimal when the value is fractional.
  public static formatDataPoint(
    value: number,
    options: {
      isPercentage?: boolean;
      isCurrency?: boolean;
      showAverageLabel?: boolean;
    } = {}
  ): string {
    const {
      isPercentage = false,
      isCurrency = false,
      showAverageLabel = false,
    } = options;

    let formatted = value.toLocaleString(
      undefined,
      isPercentage
        ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
        : isCurrency
          ? { maximumFractionDigits: 0 }
          : { maximumFractionDigits: 1 }
    );
    if (isPercentage) formatted += '%';
    if (isCurrency) formatted = '£' + formatted;
    if (showAverageLabel) formatted += isPercentage ? ' (average)' : ' (median)';
    return formatted;
  }

  public static removeLoadDateTime(
    data: Indicator[]
  ): Omit<Indicator, 'load_date_time'>[] {
    return data.map(({ load_date_time, ...rest }) => rest);
  }
}

export default TableService;
