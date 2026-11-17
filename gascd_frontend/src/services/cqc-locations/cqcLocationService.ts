import { withBasePath } from '@/lib/basePath';
import { CqcLocationProvider, CqcLocationRatings } from '@/data/cqcLocations';

class CqcLocationService {
  /** The locations matching a query built by `cqcLocationsQuery` */
  public static async getLocations(
    query: URLSearchParams
  ): Promise<CqcLocationRatings> {
    const response = await fetch(
      withBasePath(`/api/get_cqc_location_ratings?${query}`)
    );
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
  }

  /** Every care provider with a location in the list, ordered by name */
  public static async getProviders(): Promise<CqcLocationProvider[]> {
    const response = await fetch(
      withBasePath('/api/get_cqc_location_providers')
    );
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return (await response.json()).providers ?? [];
  }
}

export default CqcLocationService;
