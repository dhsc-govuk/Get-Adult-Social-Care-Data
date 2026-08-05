import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const la_code = searchParams.get('la_code');
  const metric_code = searchParams.get('metric_code');

  if (!la_code || !metric_code) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const client = getAPIClient();

  const { data, error, response } = await client.GET(
    '/metric_locations/local_authority_peers/{code}',
    {
      params: {
        path: { code: la_code },
        query: { metric_code },
      },
    }
  );

  if (!response.ok || !data || error) {
    logger.error(
      `Peer data fetch failed: ${response.status} for LA ${la_code}`
    );
    return NextResponse.json(
      { error: 'Failed to fetch peer data' },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
