import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';
import { logger } from '../../../instrumentation.node';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ status: 403 });
  }
  const body = await req.json();
  logger.info(body.message);

  return NextResponse.json({ status: 200 });
}
