import { NextResponse } from 'next/server';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from '@/data/dataAPI';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  const client = getAPIClient();

  const { data, error, response } = await client.GET(
    '/metric_locations/local_authorities'
  );

  if (!response.ok || !data || error) {
    logger.error(`Local authority list fetch failed: ${response.status}`);
    return NextResponse.json(
      { error: 'Failed to fetch local authority list' },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
