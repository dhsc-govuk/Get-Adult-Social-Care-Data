import { NextRequest, NextResponse } from 'next/server';
import { getAPIClient } from '@/data/dataAPI';
import { getDefaultLocations, validateMetricIds } from '@/data/locations';
import {
  canAccessMetric,
  getCurrentUser,
  isUserRegistered,
} from '@/lib/permissions';
import { transformSeriesData, SeriesPoint } from '@/utils/timeseries';
import logger from '@/utils/logger';
import { PEER_GROUP_LOCATION_TYPE } from '@/constants';

/**
 * The statistical peer group average of each requested metric over time, for
 * the user's LA. Returned as indicators with the location type `PeerGroup` so
 * it can sit alongside the LA, regional and national rows from the metric data
 * route in the same charts.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isUserRegistered(user)) {
    return NextResponse.json({ error: `No user` }, { status: 401 });
  }

  const body = await req.json();
  const metric_ids = validateMetricIds(body.metric_ids || []);
  if (!metric_ids.length) {
    return NextResponse.json({ error: `No metric ids` }, { status: 400 });
  }
  for (const metric_id of metric_ids) {
    if (!canAccessMetric(user, metric_id)) {
      return NextResponse.json(
        { error: `Access to metric ${metric_id} denied` },
        { status: 403 }
      );
    }
  }

  const default_locations = await getDefaultLocations(user);
  const la_code = default_locations?.find(
    (item) => item.location_type === 'LA'
  )?.location_code;
  if (!la_code) {
    return NextResponse.json(
      { error: 'No LA found for user' },
      { status: 400 }
    );
  }

  const client = getAPIClient();
  const { data, error, response } = await client.POST(
    '/metric_locations/local_authority_peers/{code}/series',
    {
      params: { path: { code: la_code } },
      body: metric_ids,
    }
  );

  if (!response.ok || !data || error) {
    logger.error(
      `Peer average series fetch failed: ${response.status} for LA ${la_code}`
    );
    return NextResponse.json(
      { error: 'Failed to fetch peer average series' },
      { status: response.status }
    );
  }

  const indicators: any[] = [];
  data.forEach((series) => {
    let points: SeriesPoint[];
    try {
      points = transformSeriesData(
        series.series_start_date || '',
        series.series_end_date || '',
        series.series_frequency || '',
        (series.values || []) as number[]
      );
    } catch (err: any) {
      logger.error(
        'Error converting peer average series for metric: ' + series.metric_code
      );
      logger.error(err.message);
      points = [];
    }
    points.forEach((point) => {
      indicators.push({
        metric_id: series.metric_code,
        location_id: la_code,
        location_type: PEER_GROUP_LOCATION_TYPE,
        metric_date: point.date,
        data_point: point.value,
      });
    });
  });

  return NextResponse.json(indicators, { status: 200 });
}
