import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ClientLogCode } from '@/services/logger/clientLogCodes';

// Server-owned mapping of client log codes to the message actually written to
// the log. The client only ever sends a code from this allowlist, so no
// attacker-controlled free text (or CRLF) can reach the log store (CWE-117).
const CLIENT_LOG_ENTRIES: Record<
  ClientLogCode,
  { level: 'error' | 'warn' | 'info'; message: string }
> = {
  [ClientLogCode.LocationFetchFailed]: {
    level: 'error',
    message: 'Client: failed to fetch location data',
  },
  [ClientLogCode.AvailableLocationsFetchFailed]: {
    level: 'error',
    message: 'Client: failed to fetch available locations',
  },
  [ClientLogCode.SetSelectedLocationFailed]: {
    level: 'error',
    message: 'Client: failed to set selected location',
  },
  [ClientLogCode.LasForRegionFetchFailed]: {
    level: 'error',
    message: 'Client: failed to fetch LAs for region',
  },
  [ClientLogCode.AppInsightsInitFailed]: {
    level: 'error',
    message: 'Client: browser App Insights failed to initialise',
  },
};

function isKnownCode(code: unknown): code is ClientLogCode {
  return (
    typeof code === 'string' &&
    Object.prototype.hasOwnProperty.call(CLIENT_LOG_ENTRIES, code)
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code: unknown = body?.code;
  if (!isKnownCode(code)) {
    // Do not echo the raw value back or into the log.
    return NextResponse.json({ error: 'Invalid log code' }, { status: 400 });
  }

  const entry = CLIENT_LOG_ENTRIES[code];
  logger.log(entry.level, entry.message, { code });

  return new NextResponse(null, { status: 204 });
}
