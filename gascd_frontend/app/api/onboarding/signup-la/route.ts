import { NextRequest, NextResponse } from 'next/server';
import { handleSignupLA } from '@/onboarding/handlers';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { type: 'error', description: 'Invalid request body' },
      { status: 400 }
    );
  }

  return NextResponse.json(await handleSignupLA(body));
}
