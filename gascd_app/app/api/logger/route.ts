import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { eventLogger } from '@/utils/eventlogging';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ status: 403 });
  }
  const body = await req.json();
  eventLogger.info(body.message);

  return NextResponse.json({ status: 200 });
}
