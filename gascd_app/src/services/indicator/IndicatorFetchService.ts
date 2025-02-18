import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

class IndicatorFetchService {
  public static async getData(query: IndicatorQuery): Promise<Indicator[]> {
    const response = await fetch('/api/get_metric_data', {
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

  public static async getDisplayData(
    metric_id: string
  ): Promise<IndicatorDisplay> {
    const response = await fetch('/api/get_metadata');
    const displayData: IndicatorDisplay = await response.json();
    return displayData;
  }
}

export default IndicatorFetchService;
