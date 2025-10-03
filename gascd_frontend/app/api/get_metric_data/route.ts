import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';

export async function POST(req: NextRequest) {
  const queryParams = await req.json();

  if (!queryParams.metric_ids?.length || !queryParams.location_ids?.length) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (process.env.DATA_API_ROOT) {
    const metric_ids = queryParams.metric_ids;
    let all_metrics: any[] = [];
    for (let metric_id of metric_ids) {
      const metric_url =
        process.env.DATA_API_ROOT +
        `/metrics/${metric_id}` +
        '?location_ids=' +
        queryParams.location_ids;
      const response = await fetch(metric_url);
      const data = await response.json();
      all_metrics.push(...data);
    }
    return NextResponse.json(all_metrics, { status: 200 });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const pool = await dbPool;
<<<<<<< HEAD:gascd_frontend/app/api/get_metric_data/route.ts
    const queryParams = await req.json();

    await addUserTelemetry();

    if (!queryParams.metric_ids?.length || !queryParams.location_ids?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
=======
>>>>>>> 2241229 (Add mocks for metric data and available locations):gascd_app/app/api/get_metric_data/route.ts

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
