import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import logger from '@/utils/logger';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getAllowedLocations } from '@/data/locations';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  if (process.env.DATA_API_ROOT) {
    try {
      const locations = await getAllowedLocations(user);
      return NextResponse.json({ data: locations }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error fetching data from API' },
        { status: 500 }
      );
    }
  }

  // XXX to remove
  try {
    const pool = await dbPool;
    const resultSet = await pool
      .request()
      .input('provider_location_id', user.locationId)
      .input('location_type', user.locationType).query(`
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
