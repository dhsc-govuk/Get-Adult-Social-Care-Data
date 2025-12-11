import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const pool = await dbPool;
    const queryParams = await req.json();

    addUserTelemetry();

    if (!queryParams.metric_ids?.length || !queryParams.location_ids?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const request = pool.request();
    const { queryString, request_with_param } =
      QueryBuilderService.createGetIndicatorQuery(
        queryParams,
        request,
        session?.user.locationType ?? '',
        session?.user.locationId ?? ''
      );
    const resultSet = await request_with_param.query(queryString);
    const rows: Indicator[] = resultSet.recordset;

    return NextResponse.json(rows);
  } catch (err) {
    logger.error('Error during database operations:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error fetching data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
