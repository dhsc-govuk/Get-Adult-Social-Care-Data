import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getCurrentUser } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  logger.info('Analytics opt out', {
    authenticated: isAuthenticated,
  });
  return NextResponse.json({ status: 'OK' });
}
