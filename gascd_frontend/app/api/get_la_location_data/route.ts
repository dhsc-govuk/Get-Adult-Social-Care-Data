import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let la_code = searchParams.get('la_code');

  if (process.env.DATA_API_ROOT) {
    const url = process.env.DATA_API_ROOT + '/localauthorities/' + la_code;
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  }

  try {
    const pool = await dbPool;
    const resultSet = await pool.request().input('la_code', la_code).query(`
        SELECT distinct
           la_code,
           la_name,
           region_code,
           region_name,
           country_code,
           country_name,
           load_date_time
        FROM ref.provider_location_full_lookup
        WHERE la_code = @la_code
      `);

    return NextResponse.json(resultSet.recordset[0], { status: 200 });
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
