import { ALLOWED_CP_USER_TYPES, LA_USER_TYPE } from '@/constants';
import { User } from '@/lib/auth';
import { canAccessMetric, isUserRegistered } from '@/lib/permissions';
import logger from '@/utils/logger';
import { getAPIClient } from './dataAPI';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';
import {
  getAllowedLocationsForUser,
  getDefaultLocations,
  validateMetricIds,
} from './locations';
import { SeriesPoint, transformSeriesData } from '@/utils/timeseries';

const REGIONAL_QUERYTYPE = 'RegionQuery';
const LA_TIMESERIES = 'LATimeseriesQuery';
const MULTI_LOCATION_TIMESERIES = 'MultiLocationTimeseriesQuery';
const USER_QUERY = 'UserQuery';
const TIME_SERIES_QUERIES = [LA_TIMESERIES, MULTI_LOCATION_TIMESERIES];

// ----------------
export async function x_y_z(payload: { user?: User }) {
  const { user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  // ...
}
// ----------------

export async function get_location_data(payload: { user?: User }) {
  const { user } = payload;
  //   console.log(':$: modulo :$:', { user });

  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  const provider_location_id = user.selectedLocationId;
  if (!provider_location_id) {
    logger.error('No selected location found for user');
    return;
  }

  const client = getAPIClient();

  if (ALLOWED_CP_USER_TYPES.includes(user.locationType || '')) {
    const { data } = await client.GET('/metric_locations/cp_locations/{code}', {
      params: {
        query: {
          include_parents: true,
        },
        path: {
          code: user.selectedLocationId || '',
        },
      },
    });
    if (data) {
      // Map api results to those expected by the client JS
      // XXX this could be ditched when we refactor the client JS
      const cp_result = {
        provider_location_id: data.code,
        provider_location_name: data.display_name,
        provider_id: data.provider_code,
        provider_name: data.provider_name,
        la_code: data.local_authority_code,
        la_name: data.local_authority_name,
        region_code: data.region_code,
        region_name: data.region_name,
        country_code: data.country_code,
        country_name: data.country_name,
      };
      return cp_result;
    }
  } else if (user.locationType == LA_USER_TYPE) {
    const { data } = await client.GET(
      '/metric_locations/local_authorities/{code}',
      {
        params: {
          query: {
            include_parents: true,
          },
          path: {
            code: user.selectedLocationId || '',
          },
        },
      }
    );
    if (data) {
      const la_result = {
        la_code: data.code,
        la_name: data.display_name,
        region_code: data.region_code,
        region_name: data.region_name,
        country_code: data.country_code,
        country_name: data.country_name,
      };
      return la_result;
    }
  }

  logger.error('No location data found for selected location', {
    selectedLocationId: user.selectedLocationId,
  });
}

export async function get_available_locations(payload: { user?: User }) {
  const { user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  try {
    const locations = await getAllowedLocationsForUser(user);
    //   ...
    return locations;
  } catch (error) {
    logger.error('Failed to fetch available locations for user', { error });

    throw new Error('Error fetching data from API');
  }
}

export async function get_la_peers(payload: {
  la_code?: string;
  metric_code?: string;
  user?: User;
}) {
  const { la_code, metric_code, user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  if (!la_code || !metric_code) {
    throw new Error('Missing parameters');
  }

  const client = getAPIClient();

  const { data, error, response } = await client.GET(
    '/metric_locations/local_authority_peers/{code}',
    {
      params: {
        path: { code: la_code },
        query: { metric_code },
      },
    }
  );

  if (!response.ok || !data || error) {
    logger.error(
      `Peer data fetch failed: ${response.status} for LA ${la_code}`
    );
    throw new Error('Failed to fetch peer data');
  }

  return data;
}

export async function get_metric_data(payload: {
  user?: User;
  metric_ids: string[];
  query_type?: string;
}) {
  const { user, query_type = 'UserQuery', metric_ids } = payload;

  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  //   console.log(':$: modulo :$:', { payload });

  await addUserTelemetry();

  const valid_metric_ids = validateMetricIds(metric_ids);

  if (!valid_metric_ids.length) {
    logger.error('No valid metric IDs provided');
    throw new Error('No metric ids');
  }

  for (let metric_id of valid_metric_ids) {
    if (!canAccessMetric(user, metric_id)) {
      throw new Error('Metric access disallowed');
    }
  }

  const user_location_data = await getDefaultLocations(user);
  const client = getAPIClient();
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
      logger.error('No region found for user');
      throw new Error('No region found for user');
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
    const user_la = user_location_data?.find(
      (item) => item.location_type == 'LA'
    );
    if (!user_la?.location_code) {
      logger.error('No LA found for user');
      throw new Error('No LA found for user');
    }
    location_data = [
      {
        location_code: user_la.location_code,
        location_type: 'LA',
      },
    ];
  } else if (
    query_type === USER_QUERY ||
    query_type === MULTI_LOCATION_TIMESERIES
  ) {
    // Get user's default locations
    location_data = user_location_data;
  } else {
    logger.error('Unsupported metric query type: ' + query_type);
    throw new Error(`Unsupported metric query type: ${query_type}`);
  }

  if (!location_data) {
    logger.error('Could not look up relevant locations for user');
    throw new Error('Could not look up relevant locations for user');
  }

  const is_timeseries = TIME_SERIES_QUERIES.includes(query_type);
  let all_metrics: any[] = [];
  for (let metric_id of metric_ids) {
    const { data, error } = await client.POST('/metrics/{metric_code}/data', {
      params: {
        path: {
          metric_code: metric_id,
        },
        query: {
          time_series: is_timeseries,
        },
      },
      body: location_data as any,
    });

    if (data) {
      data.map((metric) => {
        if (is_timeseries) {
          let series: SeriesPoint[];
          try {
            series = transformSeriesData(
              metric.series_start_date || '',
              metric.series_end_date || '',
              metric.series_frequency,
              metric.values || []
            );
          } catch (error: any) {
            logger.error(
              'Error converting time series data for metric: ' +
                metric.metric_code
            );
            logger.error(error.message);
            series = [];
          }
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
  return all_metrics;
}

export async function set_selected_location(payload: { user?: User }) {
  const { user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  // ...
}

export async function get_las_for_region(payload: { user?: User }) {
  const { user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  // ...
}

export async function get_all_total_beds_filters(payload: { user?: User }) {
  const { user } = payload;
  if (!user || !isUserRegistered(user)) {
    throw new Error('No user');
  }

  // ...
}
