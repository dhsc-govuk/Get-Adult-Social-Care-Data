import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

class IndicatorFetchService {
  public static async getData(query: IndicatorQuery): Promise<Indicator[]> {
    if (!query.metric_ids.length) {
      // Shouldn't need this check, but react sometimes fires this too soon
      return [];
    }
    const filteredQuery = {
      metric_ids: query.metric_ids,
      // We don't send this to the backend anymore - still needs pulling out of the in-page queries
      //location_ids: query.location_ids.filter((item) => item !== 'Indicator'),
      query_type: query.query_type || 'UserQuery',
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
