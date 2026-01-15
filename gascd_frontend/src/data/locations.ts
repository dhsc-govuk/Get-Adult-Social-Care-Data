//import 'server-only';
import { APIClient } from './dataAPI';
import { User } from '@/lib/auth';
import logger from '@/utils/logger';

export const getAllowedLocations = async (user: User) => {
  let location_id = user.locationId;
  let location_type = user.locationType;

  if (!(location_id && location_type)) {
    logger.error(`No location details for user`);
    return [];
  }

  let provider_code;
  if (location_type === 'Care provider') {
    provider_code = location_id;
  } else if (user.locationType === 'Care provider location') {
    // Look up the correct provider from the API
    const response = await APIClient.GET(
      '/metric_locations/cp_locations/{code}',
      {
        params: {
          path: {
            code: location_id,
          },
        },
      }
    );

    if (response.response.status != 200) {
      logger.error('Invalid API response: ' + response.response.status);
      return [];
    }
    const loc_data = response.data;
    if (!loc_data || !loc_data.provider_code) {
      logger.error(`No location data found`);
      return [];
    }
    provider_code = loc_data.provider_code;
  }

  if (!provider_code) {
    logger.error('No support for user type:' + location_type);
    return [];
  }

  const { data: provider_data } = await APIClient.GET(
    '/organisation/care_provider/{code}',
    { params: { path: { code: provider_code } } }
  );
  const locations = provider_data?.locations;
  return locations;
};
