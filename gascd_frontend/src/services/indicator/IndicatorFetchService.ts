import { Indicator } from '@/data/interfaces/Indicator';
import { Location } from '@/data/interfaces/Location';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { MetaData } from '@/data/interfaces/MetaData';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';

class IndicatorFetchService {
  public static async getFilters(metric_id: string) {
    const response = await fetch('/api/get_all_total_beds_filters');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json();

    return data.sort((a: TotalBedsFilters, b: TotalBedsFilters) =>
      a.filter_bedtype.localeCompare(b.filter_bedtype)
    );
  }

  public static async getData(query: IndicatorQuery): Promise<Indicator[]> {
    const filteredQuery = {
      metric_ids: query.metric_ids,
      location_ids: query.location_ids.filter((item) => item !== 'Indicator'),
    };
    const response = await fetch('/api/get_metric_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filteredQuery),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  }
}

export default IndicatorFetchService;
