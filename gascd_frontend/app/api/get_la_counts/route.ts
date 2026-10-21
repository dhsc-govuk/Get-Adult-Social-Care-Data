import { NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

export async function GET() {
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

  const [regionResult, nationalResult] = await Promise.all([
    client.GET('/metric_locations/regions/{code}', {
      params: { path: { code: region.location_code } },
    }),
    client.GET('/metric_locations/local_authorities'),
  ]);

  const regional = regionResult.data?.local_authorities?.length;
  const national = nationalResult.data?.local_authorities?.length;
  if (!regional || !national) {
    logger.error(`Could not count LAs for ${region.location_code}`);
    return NextResponse.json(
      { error: 'Error counting local authorities' },
      { status: 500 }
    );
  }
  return NextResponse.json({ regional, national });
}
