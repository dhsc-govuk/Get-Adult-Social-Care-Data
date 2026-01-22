import { authDB } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sql } from 'kysely';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a lightweight query against the user db
    await sql`SELECT 1`.execute(authDB);

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'error',
        message: 'User DB Connection failed',
      },
      { status: 503 }
    );
  }
}
