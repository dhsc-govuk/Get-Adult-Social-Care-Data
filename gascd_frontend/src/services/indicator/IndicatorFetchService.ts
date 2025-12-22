import { Indicator } from '@/data/interfaces/Indicator';
import { Location } from '@/data/interfaces/Location';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { MetaData } from '@/data/interfaces/MetaData';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';

class IndicatorFetchService {
  public static async getLocations(query: IndicatorQuery): Promise<Location[]> {
    const response = await fetch('/api/get_location_names', {
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

  public static async getLocalAuthoritiesInProviderLocationRegion(
    providerLocationId?: string
  ): Promise<[]> {
    const requestBody = providerLocationId
      ? { provider_location_id: providerLocationId }
      : {};
    const response = await fetch('/api/get_locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  }

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

  public static async getMetadateByType(query: string): Promise<MetaData[]> {
    const response = await fetch(
      `/api/get_metadata_by_data_types?metric_data_type=${query}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  }

  public static async getDisplayData(
    query: IndicatorQuery
  ): Promise<IndicatorDisplay[]> {
    const response = await fetch('/api/get_metadata', {
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

export default IndicatorFetchService;
