import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';
import createClient from 'openapi-fetch';
import { paths } from '@/metrics-api-schema';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  let provider_location_id = user.locationId;
  let location_type = user.locationId;

  // XXX pull out error handling to reusable place?
  if (!(provider_location_id && location_type)) {
    return NextResponse.json(
      { error: `No location details for user` },
      { status: 500 }
    );
  }

  if (process.env.DATA_API_ROOT) {
    try {
      // XXX make a reusable client method, which passes in the secret key as well
      const client = createClient<paths>({
        baseUrl: process.env.DATA_API_ROOT,
      });

      let provider_code;
      if (user.locationType === 'Care provider') {
        provider_code = user.locationId;
      } else if (user.locationType === 'Care provider location') {
        // Look up the correct provider
        const { data: loc_data } = await client.GET(
          '/metric_locations/cp_locations/{code}',
          {
            params: {
              path: {
                code: provider_location_id,
              },
            },
          }
        );
        if (!loc_data || !loc_data.provider_code) {
          return NextResponse.json(
            { error: 'No location data found' },
            { status: 404 }
          );
        }
        provider_code = loc_data.provider_code;
      }

      if (!provider_code) {
        return NextResponse.json(
          { error: `No support for user type` },
          { status: 500 }
        );
      }

      // Now find all valid locations for provider
      console.log('getting provider locations for ' + provider_code);
      const { data: provider_data } = await client.GET(
        '/organisation/care_provider/{code}',
        { params: { path: { code: provider_code } } }
      );
      const locations = provider_data?.locations;
      return NextResponse.json({ data: locations }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error fetching data' },
        { status: 500 }
      );
    }
  }

  try {
    const pool = await dbPool;
    const resultSet = await pool
      .request()
      .input('provider_location_id', provider_location_id)
      .input('location_type', location_type).query(`
        SELECT *
        FROM access.metric_location_user_access
        WHERE user_access_location_id = @provider_location_id AND user_access_location_type = @location_type AND metric_type = 'Capacity Tracker'
      `);

    return NextResponse.json(resultSet.recordset, { status: 200 });
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
