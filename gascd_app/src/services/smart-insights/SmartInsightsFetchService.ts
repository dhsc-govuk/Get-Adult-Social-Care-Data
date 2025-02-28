import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

class SmartInsightsFetchService {
  public static async getData(query: IndicatorQuery): Promise<string[]> {
    const response = await fetch('/api/get_smart_insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
  }
}

export default SmartInsightsFetchService;
