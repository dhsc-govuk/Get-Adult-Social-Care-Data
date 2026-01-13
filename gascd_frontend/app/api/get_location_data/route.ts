import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let provider_location_id = searchParams.get('provider_location_id');

  if (process.env.DATA_API_ROOT) {
    const url =
      process.env.DATA_API_ROOT + '/providers/' + provider_location_id;
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
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
