import { NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { getDefaultLocations } from '@/data/locations';
import logger from '@/utils/logger';

/**
 * INTERIM (GASCD-236). The number of local authorities in the user's region and
 * in England, used to turn the Department for Education regional and national
 * totals into per-authority averages in the browser.
 *
 * This exists only because the DfE pipeline writes those rows as totals while
 * the service presents them as averages. Delete this route once the pipeline
 * writes averages - see toLaAverages in src/helpers/locationComparison.ts.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const client = getAPIClient();
  const default_locations = await getDefaultLocations(user);
  const region_code = default_locations?.find(
    (item) => item.location_type === 'Regional'
  )?.location_code;

  const { data, error } = await client.GET(
    '/metric_locations/local_authorities'
  );

  if (!data?.local_authorities?.length) {
    logger.error('Could not list local authorities for comparator counts', {
      error: JSON.stringify(error),
    });
    return NextResponse.json(
      { error: 'Could not list local authorities' },
      { status: 500 }
    );
  }

  const all = data.local_authorities;
  const regional = region_code
    ? all.filter((la) => la.region_code === region_code).length
    : 0;

  return NextResponse.json({ regional, national: all.length }, { status: 200 });
}
