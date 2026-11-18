import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';

// The filters, each a list of values, passed on to the data API as they are
const LIST_PARAMS = [
  'la_codes',
  'provider_codes',
  'service_types',
  'ratings',
] as const;

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const page_size = searchParams.get('page_size');

  const client = getAPIClient();

  const { data, error, response } = await client.GET(
    '/metric_locations/cqc_location_ratings',
    {
      params: {
        query: {
          ...Object.fromEntries(
            LIST_PARAMS.map((param) => [param, searchParams.getAll(param)])
          ),
          ...(search ? { search } : {}),
          ...(page ? { page: Number(page) } : {}),
          ...(page_size ? { page_size: Number(page_size) } : {}),
        },
      },
    }
  );

  if (!response.ok || !data || error) {
    logger.error(`CQC location ratings fetch failed: ${response.status}`);
    return NextResponse.json(
      { error: 'Failed to fetch CQC location ratings' },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
