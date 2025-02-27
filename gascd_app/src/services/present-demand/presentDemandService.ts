import { Locations } from '@/data/interfaces/Locations';

class PresentDemandService {
  public static async getLocations(query: string): Promise<Locations> {
    try {
      const response = await fetch(
        `api/get_location_data?provider_location_id=${query}`
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

  public static async getAvailableLocations(query: string): Promise<any> {
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

  public static async getLocationNames(
    query: string,
    CareProvider: boolean
  ): Promise<string[]> {
    const data = await this.getLocations(query);

    let locationNames = [
      'Filter',
      data.la_name,
      data.region_name,
      data.country_name,
    ];
    if (CareProvider) {
      locationNames.splice(1, 0, data.provider_location_name);
    }
    return locationNames;
  }

  public static async getLocationIds(
    query: string,
    CareProvider: boolean
  ): Promise<string[]> {
    const data = await this.getLocations(query);
    const locationIds = [
      'Filter',
      data.la_code,
      data.region_code,
      data.country_code,
    ];

    if (CareProvider) {
      locationIds.splice(2, 0, data.provider_location_id);
    }
    return locationIds;
  }
}

export default PresentDemandService;
