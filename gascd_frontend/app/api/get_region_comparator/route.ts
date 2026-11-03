import { NextRequest, NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { withDataApiErrors } from '@/lib/data-api-errors';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

// The other LAs in the user's region, offered as a ready-made comparator group
async function handleGET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const default_locations = await getDefaultLocations(user);
  const region = default_locations?.find(
    (item) => item.location_type == 'Regional'
  );
  const la = default_locations?.find((item) => item.location_type == 'LA');
  if (!region?.location_code) {
    return NextResponse.json({ error: 'No region for user' }, { status: 500 });
  }

  const client = getAPIClient(
    AbortSignal.any([req.signal, AbortSignal.timeout(30000)])
  );
  const { data } = await client.GET('/metric_locations/regions/{code}', {
    params: { path: { code: region.location_code } },
  });
  if (!data?.local_authorities) {
    logger.error(`No LAs found for ${region.location_code}`);
    return NextResponse.json(
      { error: 'Error fetching region' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    region_name: data.display_name,
    la_name: data.local_authorities.find(
      (row) => row.la_code === la?.location_code
    )?.la_name,
    la_codes: data.local_authorities
      .map((row) => row.la_code)
      .filter((code) => code && code !== la?.location_code),
  });
}

export const GET = withDataApiErrors(handleGET);
