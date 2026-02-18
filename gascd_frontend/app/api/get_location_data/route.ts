import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { ALLOWED_CP_USER_TYPES, LA_USER_TYPE } from '@/constants';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const provider_location_id = user.selectedLocationId;
  if (!provider_location_id) {
    logger.error('No selected location found for user');
    return NextResponse.json([]);
  }

  const client = getAPIClient();

  if (ALLOWED_CP_USER_TYPES.includes(user.locationType || '')) {
    const { data } = await client.GET('/metric_locations/cp_locations/{code}', {
      params: {
        query: {
          include_parents: true,
        },
        path: {
          code: user.selectedLocationId || '',
        },
      },
    });
    if (data) {
      // Map api results to those expected by the client JS
      // XXX this could be ditched when we refactor the client JS
      const cp_result = {
        provider_location_id: data.code,
        provider_location_name: data.display_name,
        provider_id: data.provider_code,
        provider_name: data.provider_name,
        la_code: data.local_authority_code,
        la_name: data.local_authority_name,
        region_code: data.region_code,
        region_name: data.region_name,
        country_code: data.country_code,
        country_name: data.country_name,
      };
      return NextResponse.json(cp_result, { status: 200 });
    }
  } else if (user.locationType == LA_USER_TYPE) {
    const { data } = await client.GET(
      '/metric_locations/local_authorities/{code}',
      {
        params: {
          query: {
            include_parents: true,
          },
          path: {
            code: user.selectedLocationId || '',
          },
        },
      }
    );
    if (data) {
      const la_result = {
        la_code: data.code,
        la_name: data.display_name,
        region_code: data.region_code,
        region_name: data.region_name,
        country_code: data.country_code,
        country_name: data.country_name,
      };
      return NextResponse.json(la_result, { status: 200 });
    }
  }

  logger.error('No location data found for selected location', {
    selectedLocationId: user.selectedLocationId,
  });
  return NextResponse.json([]);
}
