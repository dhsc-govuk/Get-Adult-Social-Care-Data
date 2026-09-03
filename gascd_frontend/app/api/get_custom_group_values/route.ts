import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';
import { ALLOWED_CP_USER_TYPES, LA_USER_TYPE } from '@/constants';

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

  const client = getAPIClient();

  // The requesting LA is derived from the session, never from the client,
  // so callers cannot influence which authority is excluded from the average.
  // LA users benchmark their own authority; care-provider users benchmark
  // their location's parent LA (the same one the pages resolve for their
  // charts), so it is resolved server-side here to keep the exclusion
  // semantics identical for both user types.
  let requesting_la_code: string | undefined;
  if (user.locationType === LA_USER_TYPE && user.selectedLocationId) {
    requesting_la_code = user.selectedLocationId;
  } else if (
    ALLOWED_CP_USER_TYPES.includes(user.locationType || '') &&
    user.selectedLocationId
  ) {
    const { data: cpLocation } = await client.GET(
      '/metric_locations/cp_locations/{code}',
      {
        params: {
          query: { include_parents: true },
          path: { code: user.selectedLocationId },
        },
      }
    );
    requesting_la_code = cpLocation?.local_authority_code ?? undefined;
    if (!requesting_la_code) {
      // Proceed without the exclusion rather than failing the whole request:
      // the average is then computed over the full group.
      logger.warn(
        `Could not resolve parent LA for care provider location ${user.selectedLocationId}`
      );
    }
  }

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
