import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const pool = await dbPool;
    const { searchParams } = new URL(req.url);
    let provider_location_id = searchParams.get('provider_location_id');
    let location_type =
      searchParams.get('location_type') || 'Care provider location';
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
