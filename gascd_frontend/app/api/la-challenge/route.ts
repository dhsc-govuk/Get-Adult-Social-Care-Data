import { issueLaChallenge } from '@/lib/la-challenge';
import { NextResponse } from 'next/server';
import logger from '@/utils/logger';

export async function POST() {
  try {
    await issueLaChallenge();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to issue LA challenge', { error });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}