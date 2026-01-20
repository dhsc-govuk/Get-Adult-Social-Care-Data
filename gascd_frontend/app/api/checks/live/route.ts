import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // If the process is alive, this returns immediately.
  return new NextResponse('OK', { status: 200 });
}
