import LogService from '../logger/logService';
import { Locations } from '@/data/interfaces/Locations';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { authClient } from '@/lib/auth-client';

export interface AvailableLocation {
  location_id: string;
  location_name: string;
  address: string;
  provider_name: string;
  la_name: string;
}

class LocationService {
  public static async getLocations(query: string): Promise<Locations> {
    try {
      const response = await fetch('/api/get_location_data');

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

  public static async getAvailableLocations(): Promise<AvailableLocation[]> {
    try {
      const response = await fetch(`/api/get_available_locations`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      let availableLocations = (await response.json()).data;
      availableLocations = availableLocations.map((loc: AvailableLocation) => {
        return {
          ...loc,
          location_name: loc.location_name + ` (${loc.la_name})`,
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

  public static async getLocationNames(
    query: string,
    careProvider: boolean
  ): Promise<LocationNames> {
    const data = await this.getLocations(query);

    const locationNames: LocationNames = {
      IndicatorLabel: 'Indicator',
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
    CareProvider: boolean
  ): Promise<string[]> {
    const data = await this.getLocations(query);

    const locationIds = [
      'Indicator',
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
      const response = await fetch(`/api/set_selected_location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location_id: locationId }),
      });
      // Force the session cache to refresh
      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
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
      const response = await fetch('/api/get_las_for_region');

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sort((item1: any, item2: any) =>
        item1.la_name.localeCompare(item2.la_name)
      );
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
