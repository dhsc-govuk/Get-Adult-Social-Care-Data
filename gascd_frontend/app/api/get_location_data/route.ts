import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (process.env.DATA_API_ROOT) {
    const client = getAPIClient();
    const { data } = await client.GET('/metric_locations/cp_locations/{code}', {
      params: {
        query: {
          include_parents: true,
        },
        path: {
          code: user?.selectedLocationId || '',
        },
      },
    });
    if (data) {
      // Map api results to those expected by the client JS
      // XXX this could be ditched when we refactor the client JS
      const result = {
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
      return NextResponse.json(result, { status: 200 });
    }
  }

  try {
    const pool = await dbPool;
    const resultSet = await pool
      .request()
      .input('provider_location_id', provider_location_id).query(`
        SELECT 
           provider_location_id,
           provider_location_name,
           provider_id,
           provider_name,
           la_code,
           la_name,
           region_code,
           region_name,
           country_code,
           country_name,
           load_date_time
        FROM ref.provider_location_full_lookup
        WHERE provider_location_id = @provider_location_id
      `);

    let results: [];
    if (resultSet.recordset.length) {
      results = resultSet.recordset[0];
    } else {
      logger.warn('No location data found');
      results = [];
    }
    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
