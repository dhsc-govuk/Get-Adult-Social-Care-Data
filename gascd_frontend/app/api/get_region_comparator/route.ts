import { NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

// Every LA in the user's region, their own included, offered as a ready-made comparator group
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const default_locations = await getDefaultLocations(user);
  const region = default_locations?.find(
    (item) => item.location_type == 'Regional'
  );
  if (!region?.location_code) {
    return NextResponse.json({ error: 'No region for user' }, { status: 500 });
  }

  const { data } = await getAPIClient().GET(
    '/metric_locations/regions/{code}',
    {
      params: { path: { code: region.location_code } },
    }
  );
  if (!data?.local_authorities) {
    logger.error(`No LAs found for ${region.location_code}`);
    return NextResponse.json(
      { error: 'Error fetching region' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    region_name: data.display_name,
    la_codes: data.local_authorities
      .map((row) => row.la_code)
      .filter((code) => code),
  });
}
