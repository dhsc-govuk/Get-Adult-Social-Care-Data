import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { Locations } from '@/data/interfaces/Locations';
import IndicatorFetchService from '../indicator/IndicatorFetchService';
import IndicatorDisplayService from '../indicator/IndicatorDisplayService';

class PresentDemandService {
  public static async getLocations(query: string): Promise<Locations> {
    try {
      const response = await fetch(
        `/api/get_location_data?provider_location_id=${query}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('error', error);
      throw new Error('Failed to retrieve location data');
    }
  }

  public static async getLaLocations(query: string): Promise<Locations> {
    try {
      const response = await fetch(
        `/api/get_la_location_data?la_code=${query}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('error', error);
      throw new Error('Failed to retrieve location data');
    }
  }

  public static async getAvailableLocations(
    query: string
  ): Promise<Indicator[]> {
    try {
      const response = await fetch(
        `api/get_available_locations?provider_location_id=${query}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('error', error);
      throw new Error('Failed to retrieve available location data');
    }
  }

  public static async getDefaultCPLocation(
    providerLocationId: string,
    locationType: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `api/get_available_locations?provider_location_id=${encodeURIComponent(providerLocationId)}&location_type=${encodeURIComponent(locationType)}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0].metric_location_id;
    } catch (error) {
      console.error('error', error);
      throw new Error('Failed to retrieve available location data');
    }
  }

  public static async getLocationNames(
    query: string,
    careProvider: boolean,
    presentDemand: boolean = true
  ): Promise<string[]> {
    const data = presentDemand
      ? await this.getLocations(query)
      : await this.getLaLocations(query);

    let locationNames = [
      presentDemand ? 'Filter' : 'Location',
      data.la_name,
      data.region_name,
      data.country_name,
    ];

    if (careProvider) {
      locationNames.splice(1, 0, data.provider_location_name);
    }

    return locationNames;
  }

  public static async getLocationIds(
    query: string,
    CareProvider: boolean,
    presentDemand: boolean = true
  ): Promise<string[]> {
    const data = presentDemand
      ? await this.getLocations(query)
      : await this.getLaLocations(query);

    const locationIds = [
      presentDemand ? 'Filter' : 'Location',
      data.la_code,
      data.region_code,
      data.country_code,
    ];

    if (CareProvider) {
      locationIds.splice(1, 0, data.provider_location_id);
    }
    return locationIds;
  }

  public static formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  public static createDate(data: string): Date {
    const [day, month, year] = data.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
  }

  public static getMostRecentIndicator(indicators: Indicator[]): string {
    if (indicators.length === 0) {
      return '';
    }

    return indicators
      .reduce((latest, current) => {
        return this.createDate(current.metric_date.toString()) >
          this.createDate(latest.metric_date.toString())
          ? current
          : latest;
      }, indicators[0])
      .metric_date.toString();
  }

  public static getMostRecentDate(data: Indicator[]): string {
    const recentData = this.getMostRecentIndicator(data);
    return this.formatDate(recentData);
  }

  public static async getDataSource(
    dataQuery1: IndicatorQuery,
    dataQuery2?: IndicatorQuery
  ): Promise<string> {
    const combinedQuery: IndicatorQuery = {
      metric_ids: [
        ...new Set([
          ...dataQuery1.metric_ids,
          ...(dataQuery2?.metric_ids || []),
        ]),
      ],
      location_ids: [
        ...new Set([
          ...dataQuery1.location_ids,
          ...(dataQuery2?.location_ids || []),
        ]),
      ],
    };

    const metaData = await IndicatorFetchService.getDisplayData(combinedQuery);

    return IndicatorDisplayService.getSource(metaData);
  }
}
export default PresentDemandService;
