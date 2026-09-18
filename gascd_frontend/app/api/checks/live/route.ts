import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (process.env.CLIENT_IP_DIAGNOSTICS === 'true') {
    // Keep the fields on one console-log line so Log Analytics can find the complete diagnostic.
    logger.info(
      `Client IP diagnostic ${JSON.stringify({
        socketIp: request.headers.get('x-azure-socketip'),
        forwardedFor: request.headers.get('x-forwarded-for'),
        requestId: request.headers.get('x-request-id'),
      })}`
    );
  }

  // No database dependency; disable diagnostic logging after the header check.
  return new NextResponse('OK', {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
