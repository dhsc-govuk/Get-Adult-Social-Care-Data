import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '../../../src/data/dbModule';
import { Indicator } from '@/data/interfaces/Indicator';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import logger from '@/utils/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';
import { getAPIClient } from '@/data/dataAPI';
import { getDefaultLocations } from '@/data/locations';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const queryParams = await req.json();
  const query_type = queryParams.query_type;
  if (!queryParams.metric_ids?.length) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (process.env.DATA_API_ROOT) {
    const client = getAPIClient();

    const metric_ids = queryParams.metric_ids;
    console.log(query_type, metric_ids);
    const user_location_data = await getDefaultLocations(user);
    let location_data;

    if (query_type === 'Region') {
      // All users can access across regions
      const user_region = user_location_data?.find(
        (item) => item.location_type == 'Regional'
      );
      const { data, error } = await client.GET(
        '/metric_locations/regions/{code}',
        {
          params: {
            path: {
              code: user_region?.location_code,
            },
          },
        }
      );
      if (data) {
        location_data = data.local_authorities?.map((item) => {
          return {
            location_type: 'LA',
            location_code: item.la_code,
          };
        });
        console.log(location_data);
      }
    } else {
      // Get user's default locations
      location_data = user_location_data;
    }

    if (!location_data) {
      return NextResponse.json(
        { error: 'Could not look up relevant locations for user' },
        { status: 400 }
      );
    }

    let all_metrics: any[] = [];
    for (let metric_id of metric_ids) {
      const { data, error } = await client.POST('/metrics/{metric_code}/data', {
        params: {
          path: {
            metric_code: metric_id,
          },
        },
        body: location_data as any,
      });
      if (data) {
        data.map((item) => {
          all_metrics.push({
            metric_id: item.metric_code,
            location_id: item.location_code,
            location_type: item.location_type,
            metric_date: item.series_end_date,
            data_point: item.values && item.values[0],
          });
        });
      }
    }
    console.log(all_metrics);
    return NextResponse.json(all_metrics, { status: 200 });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const pool = await dbPool;

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
