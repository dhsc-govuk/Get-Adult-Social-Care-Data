import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';
import { LA_USER_TYPE } from '@/constants';

const MAX_LA_CODES = 500;

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const la_codes = searchParams.getAll('la_codes');
  const metric_code = searchParams.get('metric_code');

  if (la_codes.length === 0 || !metric_code) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  if (la_codes.length > MAX_LA_CODES) {
    return NextResponse.json(
      { error: 'Too many local authority codes' },
      { status: 400 }
    );
  }

  // The requesting LA is derived from the session, never from the client,
  // so callers cannot influence which authority is excluded from the average.
  const requesting_la_code =
    user.locationType === LA_USER_TYPE && user.selectedLocationId
      ? user.selectedLocationId
      : undefined;

  const client = getAPIClient();

  const { data, error, response } = await client.GET(
    '/metric_locations/custom_local_authority_group',
    {
      params: {
        query: {
          la_codes,
          metric_code,
          ...(requesting_la_code ? { requesting_la_code } : {}),
        },
      },
    }
  );

  if (!response.ok || !data || error) {
    logger.error(
      `Custom group data fetch failed: ${response.status} for metric ${metric_code}`
    );
    return NextResponse.json(
      { error: 'Failed to fetch custom group data' },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
