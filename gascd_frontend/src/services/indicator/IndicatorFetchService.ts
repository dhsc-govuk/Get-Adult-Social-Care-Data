import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { withBasePath } from '@/lib/basePath';

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
    const response = await fetch(withBasePath('/api/get_metric_data'), {
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

  /**
   * The statistical peer group average of each metric over time for the user's
   * LA, as indicators with the location type `PeerGroup`.
   */
  public static async getPeerGroupAverages(
    metricIds: string[]
  ): Promise<Indicator[]> {
    if (!metricIds.length) {
      return [];
    }
    const response = await fetch(withBasePath('/api/get_la_peer_averages'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metric_ids: metricIds }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch peer group averages: ${response.statusText}`
      );
    }
    return response.json();
  }
}

export default IndicatorFetchService;
