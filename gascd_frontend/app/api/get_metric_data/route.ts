import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';
import { APIClient } from '@/data/dataAPI';

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
    const location_query = queryParams.location_ids.map((item: string) => {
      return {
        location_code: item,
        location_type: 'Regional', // XXX this needs to come from somewhere,
      };
    });

    let all_metrics: any[] = [];
    for (let metric_id of metric_ids) {
      const { data, error } = await APIClient.POST(
        '/metrics/{metric_code}/data',
        {
          params: {
            path: {
              metric_code: metric_id,
            },
          },
          body: location_query,
        }
      );
      if (data) {
        all_metrics.push(data);
      }
    }
    return NextResponse.json(all_metrics, { status: 200 });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const pool = await dbPool;
    const queryParams = await req.json();

    await addUserTelemetry();

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
