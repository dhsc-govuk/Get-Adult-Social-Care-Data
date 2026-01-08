import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    // const pool = await dbPool;
    // const resultSet = await pool
    //   .request()
    //   .input('provider_location_id', provider_location_id).query(`
    //     SELECT
    //        provider_location_id,
    //        provider_location_name,
    //        provider_id,
    //        provider_name,
    //        la_code,
    //        la_name,
    //        region_code,
    //        region_name,
    //        country_code,
    //        country_name,
    //        load_date_time
    //     FROM ref.provider_location_full_lookup
    //     WHERE provider_location_id = @provider_location_id
    //   `);

    console.log('In get_location_data/route.ts GET function');

    const { searchParams } = new URL(req.url);
    let provider_location_id = '1-222222222';

    const url =
      'http://localhost:5050/api/metric_locations/cp_locations/' +
      provider_location_id;

    const response = await fetch(url, {
      headers: {
        'x-api-key': 'secret-key',
      },
    });

    const data = await response.json();
    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
