import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ status: 403 });
  }
  const body = await req.json();
  logger.info(body.message);

  return NextResponse.json({ status: 200 });
}
