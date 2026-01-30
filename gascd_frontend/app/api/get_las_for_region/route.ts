import { NextRequest, NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const client = getAPIClient();
  const default_locations = await getDefaultLocations(user);
  const region = default_locations?.find(
    (item) => item.location_type == 'Regional'
  );
  if (!region?.location_code) {
    return NextResponse.json({ error: 'No region for user' }, { status: 500 });
  }

  const { data, error } = await client.GET('/metric_locations/regions/{code}', {
    params: {
      path: {
        code: region.location_code,
      },
    },
  });
  if (data && data.local_authorities) {
    const rows = data.local_authorities.map((row) => ({
      la_name: row.la_name,
      la_code: row.la_code,
    }));
    return NextResponse.json(rows);
  } else {
    logger.error(`No LAs found for ${region.location_code}`);
    return NextResponse.json(
      { error: `Error fetching filters data` },
      { status: 500 }
    );
  }
}
