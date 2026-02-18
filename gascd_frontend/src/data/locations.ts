import 'server-only';
import { getAPIClient } from './dataAPI';
import { User } from '@/lib/auth';
import logger from '@/utils/logger';
import { ALLOWED_CP_USER_TYPES, LA_USER_TYPE } from '@/constants';

export const getDefaultLocationsCP = async (cp_location_id: string) => {
  const client = getAPIClient();
  // Look up details for the selected location, including all parent locations
  const { data: cpdata, error } = await client.GET(
    '/metric_locations/cp_locations/{code}',
    {
      params: {
        path: {
          code: cp_location_id,
        },
        query: {
          include_parents: true,
        },
      },
    }
  );
  if (cpdata) {
    const default_locations = [
      {
        location_code: cpdata.code,
        location_type: 'CareProviderLocation',
      },
      {
        location_code: cpdata.local_authority_code,
        location_type: 'LA',
      },
      {
        location_code: cpdata.region_code,
        location_type: 'Regional',
      },
      {
        location_code: cpdata.country_code,
        location_type: 'National',
      },
    ];
    return default_locations;
  }
};

export const getDefaultLocationsLA = async (la_location_id: string) => {
  const client = getAPIClient();
  // Look up details for the selected location, including all parent locations
  const { data: ladata, error } = await client.GET(
    '/metric_locations/local_authorities/{code}',
    {
      params: {
        path: {
          code: la_location_id,
        },
        query: {
          include_parents: true,
        },
      },
    }
  );
  if (ladata) {
    const default_locations = [
      {
        location_code: ladata.code,
        location_type: 'LA',
      },
      {
        location_code: ladata.region_code,
        location_type: 'Regional',
      },
      {
        location_code: ladata.country_code,
        location_type: 'National',
      },
    ];
    return default_locations;
  }
};

export const getDefaultLocations = async (user: User) => {
  let selected_location_id = user.selectedLocationId;
  let location_type = user.locationType;

  if (!(selected_location_id && location_type)) {
    logger.error(`No location details for user`);
    return [];
  }
  if (ALLOWED_CP_USER_TYPES.includes(location_type)) {
    return getDefaultLocationsCP(selected_location_id);
  } else if (location_type == LA_USER_TYPE) {
    return getDefaultLocationsLA(selected_location_id);
  } else {
    logger.error(`Unknown user type: ` + location_type);
    return [];
  }
};

export const getAllowedLocationsForUser = async (user: User) => {
  const location_id = user.locationId;
  const location_type = user.locationType;
  if (!(location_id && location_type)) {
    logger.error(`No location details for user`);
    return [];
  }

  let allowed_locations = [];
  // Support for multiple comma-separated location ids
  const location_ids = location_id.split(',');
  for (let location_id of location_ids) {
    const newLocations = await getAllowedLocations(location_id, location_type);
    allowed_locations.push(...newLocations);
  }
  const unique_allowed_locations = Array.from(
    new Map(allowed_locations.map((item) => [item.location_id, item])).values()
  );
  return unique_allowed_locations;
};

export const getAllowedLocations = async (
  location_id: string,
  location_type: string
) => {
  const client = getAPIClient();
  let provider_code;
  if (location_type === 'Care provider') {
    provider_code = location_id;
  } else if (location_type === 'Care provider location') {
    // Look up the correct provider from the API
    const response = await client.GET('/metric_locations/cp_locations/{code}', {
      params: {
        path: {
          code: location_id,
        },
      },
    });
    const loc_data = response.data;
    if (!loc_data || !loc_data.provider_code) {
      logger.error(`No location data found`);
      return [];
    }
    provider_code = loc_data.provider_code;
  } else {
    logger.error('No support for user type:' + location_type);
    return [];
  }

  const { data: provider_data } = await client.GET(
    '/organisation/care_provider/{code}',
    { params: { path: { code: provider_code } } }
  );
  const locations = provider_data?.locations;
  if (!locations) {
    logger.error('No locations found for:' + provider_code);
    return [];
  }

  // map from api 'code' to 'id' as expected by client JS
  const available_locations = locations?.map((location) => {
    return {
      location_id: location.location_code,
      location_name: location.location_name,
      location_display_name: location.location_name + ` (${location.la_name})`,
      provider_name: provider_data?.display_name,
      address: location.address,
      la_name: location.la_name,
      location_category: location.location_category,
    };
  });
  return available_locations;
};

/**
 * Validates and sanitizes a list of string IDs.
 * Returns only the IDs that pass the alphanumeric + underscore check.
 */
export function validateMetricIds(ids: string[]): string[] {
  const validPattern = /^[a-zA-Z0-9_]+$/;

  return ids
    .map((id) => id.trim()) // Remove accidental whitespace
    .filter((id) => id.length > 0 && validPattern.test(id));
}
