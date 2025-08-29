import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { Locations } from '@/data/interfaces/Locations';
import IndicatorFetchService from '../indicator/IndicatorFetchService';
import IndicatorDisplayService from '../indicator/IndicatorDisplayService';
import LogService from '../logger/logService';
import IndicatorService from '../indicator/IndicatorService';

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getLocations: ${errorMessage}`);
      throw new Error(`Failed to retrieve location data: ${errorMessage}`);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getLaLocations: ${errorMessage}`);
      throw new Error(`Failed to retrieve location data: ${errorMessage}`);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getAvailableLocations: ${errorMessage}`);
      throw new Error(
        `Failed to retrieve available location data: ${errorMessage}`
      );
    }
  }

  public static async checkCPLocation(
    cpLocationID: string,
    userLocationId: string
  ) {
    // Verify that the user can actually view the given cpLocation
    // XXX - this should ideally be handled by a completely different permissions setup
    const valid_locations = await this.getAvailableLocations(userLocationId);
    const valid_location_ids = valid_locations.map(
      (item) => item.metric_location_id
    );
    return valid_location_ids.includes(cpLocationID);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getDefaultCPLocation: ${errorMessage}`);
      throw new Error(
        `Failed to retrieve available location data: ${errorMessage}`
      );
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
    if (!dateStr.includes('/')) {
      // Not a recognised format
      return dateStr;
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  public static getMostRecentIndicator(
    indicators: Indicator[],
    metric_ids?: string[]
  ): string {
    if (indicators.length === 0) {
      return '';
    }

    let filtered_indicators = indicators;
    if (metric_ids) {
      filtered_indicators = indicators.filter((item) =>
        metric_ids.includes(item.metric_id)
      );
    }

    if (filtered_indicators.length === 0) {
      return '';
    }

    return filtered_indicators
      .reduce((latest, current) => {
        return IndicatorService.parseDate(current) >
          IndicatorService.parseDate(latest)
          ? current
          : latest;
      }, filtered_indicators[0])
      .metric_date.toString();
  }

  public static getMostRecentDate(
    data: Indicator[],
    metric_ids?: string[]
  ): string {
    const recentData = this.getMostRecentIndicator(data, metric_ids);
    if (recentData) {
      return this.formatDate(recentData);
    } else {
      return '';
    }
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
