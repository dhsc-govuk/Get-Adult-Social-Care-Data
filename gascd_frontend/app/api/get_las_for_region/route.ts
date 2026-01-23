import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  if (process.env.DATA_API_ROOT) {
    const client = getAPIClient();
    const default_locations = await getDefaultLocations(user);
    const region = default_locations?.find(
      (item) => item.location_type == 'Regional'
    );
    if (!region?.location_code) {
      return NextResponse.json(
        { error: 'No region for user' },
        { status: 500 }
      );
    }

    const { data, error } = await client.GET(
      '/metric_locations/regions/{code}',
      {
        params: {
          path: {
            code: region.location_code,
          },
        },
      }
    );
    if (data && data.local_authorities) {
      const rows = data.local_authorities.map((row) => ({
        location_name: row.la_name,
        location_id: row.la_code,
      }));
      console.log(rows);
      return NextResponse.json(rows);
    } else {
      logger.error(`No LAs found for ${region.location_code}`);
      return NextResponse.json(
        { error: `Error fetching filters data` },
        { status: 500 }
      );
    }
  }

  try {
    const { searchParams } = new URL(req.url);
    let region_code = searchParams.get('region_code');
    const pool = await dbPool;
    const resultSet = await pool
      .request()
      .input('region_code', region_code)
      .query('SELECT * FROM ref.la_lookup WHERE region_code = @region_code');

    const rows = resultSet.recordset;

    return NextResponse.json(rows);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
