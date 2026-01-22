import LogService from '../logger/logService';
import { Locations } from '@/data/interfaces/Locations';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { authClient } from '@/lib/auth-client';

export interface AvailableLocation {
  location_id: string;
  location_name: string;
}

class LocationService {
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
    provider_location_id?: string
  ): Promise<AvailableLocation[]> {
    if (!provider_location_id) {
      const session = await authClient.getSession();
      provider_location_id = session?.data?.user?.locationId || '';
    }
    try {
      const response = await fetch(
        `/api/get_available_locations?provider_location_id=${provider_location_id}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      let results = await response.json();
      let availableLocations = results.map((item: any) => {
        return {
          location_id: item.metric_location_id,
          location_name: item.metric_location_name,
        };
      });
      return availableLocations.sort(
        (a: AvailableLocation, b: AvailableLocation) =>
          a.location_name.localeCompare(b.location_name)
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getAvailableLocations: ${errorMessage}`);
      throw new Error(
        `Failed to retrieve available location data: ${errorMessage}`
      );
    }
  }

  public static chunkLocations(
    locations: AvailableLocation[]
  ): AvailableLocation[][] {
    const chunkSize = 20;
    const chunkedLocations: AvailableLocation[][] = [];

    for (let i = 0; i < locations.length; i += chunkSize) {
      const chunk = locations.slice(i, i + chunkSize);
      chunkedLocations.push(chunk);
    }
    return chunkedLocations;
  }

  public static async checkCPLocation(
    cpLocationID: string,
    userLocationId: string
  ) {
    // Verify that the user can actually view the given cpLocation
    // XXX - this should ideally be handled by a completely different permissions setup
    const valid_locations = await this.getAvailableLocations(userLocationId);
    const valid_location_ids = valid_locations.map((item) => item.location_id);
    return valid_location_ids.includes(cpLocationID);
  }

  public static async getDefaultCPLocation(
    providerLocationId: string,
    locationType: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `/api/get_available_locations?provider_location_id=${encodeURIComponent(providerLocationId)}&location_type=${encodeURIComponent(locationType)}`
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
  ): Promise<LocationNames> {
    const data = presentDemand
      ? await this.getLocations(query)
      : await this.getLaLocations(query);

    const locationNames: LocationNames = {
      IndicatorLabel: presentDemand ? 'Indicator' : 'Location',
      CPLabel:
        careProvider && data.provider_location_name
          ? data.provider_location_name
          : 'N/A',
      LALabel: data.la_name,
      RegionLabel: data.region_name,
      CountryLabel: data.country_name,
    };

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
      presentDemand ? 'Indicator' : 'Location',
      data.la_code,
      data.region_code,
      data.country_code,
    ];

    if (CareProvider) {
      locationIds.splice(1, 0, data.provider_location_id);
    }
    return locationIds;
  }

  public static async getSelectedLocation(): Promise<string> {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      throw new Error('No user session found');
    }
    return session.data.user.selectedLocationId ?? '';
  }

  public static async getSelectedLocationDisplayName(): Promise<string> {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      throw new Error('No user session found');
    }
    return session.data.user.selectedLocationDisplayName ?? '';
  }

  public static async setSelectedLocation(
    locationId: string,
    locationName: string
  ) {
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        throw new Error('No user session found');
      }
      await authClient.updateUser({
        selectedLocationId: locationId,
        selectedLocationDisplayName: locationName,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in setSelectedLocation: ${errorMessage}`);
      throw new Error(`Failed to set selected location: ${errorMessage}`);
    }
  }

  public static async getLasForRegion(regionCode: string): Promise<any> {
    try {
      const response = await fetch(
        `/api/get_las_for_region?region_code=${encodeURIComponent(regionCode)}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      LogService.logEvent(`Error in getLasForRegion: ${errorMessage}`);
      throw new Error(
        `Failed to retrieve local authorities in region: ${errorMessage}`
      );
    }
  }
}

export default LocationService;
