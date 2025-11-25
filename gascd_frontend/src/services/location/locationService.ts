import LogService from '../logger/logService';
import { Locations } from '@/data/interfaces/Locations';
import { Indicator } from '@/data/interfaces/Indicator';

class LocationService {
  public static async getLocations(query: string): Promise<Locations> {
    try {
      const response = await fetch(
        `http://localhost:3000/api/get_location_data?provider_location_id=${query}`
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
        `http://localhost:3000/api/get_la_location_data?la_code=${query}`
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
        `http://localhost:3000/api/get_available_locations?provider_location_id=${query}`
      );
      console.log(response);
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
      (item: any) => item.metric_location_id
    );
    return valid_location_ids.includes(cpLocationID);
  }

  public static async getDefaultCPLocation(
    providerLocationId: string,
    locationType: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `http://localhost:3000/api/get_available_locations?provider_location_id=${encodeURIComponent(providerLocationId)}&location_type=${encodeURIComponent(locationType)}`
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
}

export default LocationService;
