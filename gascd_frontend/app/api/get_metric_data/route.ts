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
import { transformSeriesData } from '@/utils/timeseries';

const REGIONAL_QUERYTYPE = 'RegionQuery';
const LA_TIMESERIES = 'LATimeseriesQuery';
const USER_QUERY = 'UserQuery';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const queryParams = await req.json();
  const query_type = queryParams.query_type;

  await addUserTelemetry();

  if (process.env.DATA_API_ROOT) {
    const client = getAPIClient();

    const metric_ids = queryParams.metric_ids;
    console.log(query_type, metric_ids);
    const user_location_data = await getDefaultLocations(user);
    let location_data;

    if (query_type === REGIONAL_QUERYTYPE) {
      // All users can access across regions
      const user_region = user_location_data?.find(
        (item) => item.location_type === 'Regional'
      );
      const user_country = user_location_data?.find(
        (item) => item.location_type == 'National'
      );
      if (!user_region?.location_code) {
        console.error('No region found for user');
        return NextResponse.json(
          { error: 'No region found for user' },
          { status: 400 }
        );
      }

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
        location_data = [
          {
            location_type: 'National',
            location_code: user_country?.location_code,
          },
          {
            location_type: 'Regional',
            location_code: user_region.location_code,
          },
        ];
        data.local_authorities?.map((item) => {
          location_data.push({
            location_type: 'LA',
            location_code: item.la_code,
          });
        });
      }
    } else if (query_type === LA_TIMESERIES) {
      // This is currently covering two scenarios and should be split out
      const user_la = user_location_data?.find(
        (item) => item.location_type == 'LA'
      );
      const user_region = user_location_data?.find(
        (item) => item.location_type == 'Regional'
      );
      const user_country = user_location_data?.find(
        (item) => item.location_type == 'National'
      );
      if (!user_la?.location_code) {
        console.error('No LA found for user');
        return NextResponse.json(
          { error: 'No LA found for user' },
          { status: 400 }
        );
      }
      location_data = [
        {
          location_code: user_la.location_code,
          location_type: 'LA',
        },
        {
          location_code: user_region?.location_code,
          location_type: 'Regional',
        },
        {
          location_code: user_country?.location_code,
          location_type: 'National',
        },
      ];
    } else if (query_type === USER_QUERY) {
      // Get user's default locations
      location_data = user_location_data;
    } else {
      console.error('Unsupported metric query type: ' + query_type);
      return NextResponse.json(
        { error: 'Unsupported metric query type:' + query_type },
        { status: 400 }
      );
    }

    if (!location_data) {
      console.error('Could not look up relevant locations for user');
      return NextResponse.json(
        { error: 'Could not look up relevant locations for user' },
        { status: 400 }
      );
    }

    console.log('Looking for metrics in: ', location_data);
    let all_metrics: any[] = [];
    for (let metric_id of metric_ids) {
      const { data, error } = await client.POST('/metrics/{metric_code}/data', {
        params: {
          path: {
            metric_code: metric_id,
          },
          query: {
            time_series: query_type === LA_TIMESERIES,
          },
        },
        body: location_data as any,
      });
      if (data) {
        data.map((metric) => {
          if (query_type === LA_TIMESERIES) {
            const series = transformSeriesData(
              metric.series_start_date || '',
              metric.series_end_date || '',
              metric.series_frequency,
              metric.values || []
            );
            series.map((series_item) => {
              all_metrics.push({
                metric_id: metric.metric_code,
                location_id: metric.location_code,
                location_type: metric.location_type,
                metric_date: series_item.date,
                data_point: series_item.value,
              });
            });
          } else {
            all_metrics.push({
              metric_id: metric.metric_code,
              location_id: metric.location_code,
              location_type: metric.location_type,
              metric_date: metric.series_end_date,
              data_point: metric.values && metric.values[0],
            });
          }
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
