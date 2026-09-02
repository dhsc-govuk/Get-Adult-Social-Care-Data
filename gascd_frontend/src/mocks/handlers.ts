import { http, HttpResponse } from 'msw';
import { metric_metadata } from '@/data/mockResponses/metric_metadata';
import { locations_data } from '@/data/mockResponses/locations_data';
import { organisation_data } from '@/data/mockResponses/organisation_data';
import { metric_filters_data } from '@/data/mockResponses/metric_filters_data';
import { API_SUFFIX } from '@/data/dataAPI';

const api_root = process.env.DATA_API_ROOT + API_SUFFIX;

export const handlers = [
  http.get(api_root + '/organisation/care_provider/:code', () => {
    return HttpResponse.json(organisation_data);
  }),

  http.get(api_root + '/metrics/:metricId/metadata', () => {
    return HttpResponse.json(metric_metadata);
  }),

  http.get(api_root + '/metric_filters/:metricGroupId', () => {
    return HttpResponse.json(metric_filters_data);
  }),

  http.post<{ metric_id: string }>(
    api_root + '/metrics/:metric_id/data',
    async ({ request, params }) => {
      const metric_id = params.metric_id;
      const url = new URL(request.url);
      const time_series = url.searchParams.get('time_series') === 'true';

      const locations = (await request.json()) as any;

      let metrics: any[] = [];

      const fake_data = ['100', '200', '300', '200', '150'];
      for (let location of locations) {
        let fake_metric: any = {
          metric_code: metric_id,
          location_code: location.location_code,
          location_type: location.location_type,
          series_end_date: '2024-01-05',
          series_frequency: 'Daily',
          // Mimic data API by returning the last value by default
          values: [fake_data[fake_data.length - 1]],
        };
        if (time_series) {
          fake_metric.series_start_date = '2024-01-01';
          fake_metric.values = fake_data;
        }
        metrics.push(fake_metric);
      }

      return HttpResponse.json(metrics);
    }
  ),

  http.get(
    api_root + '/metric_locations/cp_locations/:care_provider_code',
    () => {
      return HttpResponse.json(locations_data.care_provider_location);
    }
  ),

  http.get(api_root + '/metric_locations/local_authorities/:la_code', () => {
    return HttpResponse.json(locations_data.local_authority);
  }),

  http.get(api_root + '/metric_locations/local_authorities', () => {
    return HttpResponse.json({
      local_authorities: [
        {
          code: 'testla1',
          display_name: 'Test LA One',
          region_code: 'E12000001',
          region_name: 'North East',
        },
        {
          code: 'testla2',
          display_name: 'Test LA Two',
          region_code: 'E12000001',
          region_name: 'North East',
        },
        {
          code: 'testla3',
          display_name: 'Test LA Three',
          region_code: 'E12000002',
          region_name: 'North West',
        },
      ],
    });
  }),

  http.get(
    api_root + '/metric_locations/local_authority_peers/:la_code',
    () => {
      return HttpResponse.json({
        local_authority_peers: [
          {
            code: 'testla2',
            display_name: 'Test LA Two',
            peer_ranking: 1,
            metric_value: 20.5,
          },
          {
            code: 'testla3',
            display_name: 'Test LA Three',
            peer_ranking: 2,
            metric_value: 18.5,
          },
        ],
        average_peer_group: 19.5,
        national_average: 15.5,
      });
    }
  ),

  http.get(
    api_root + '/metric_locations/custom_local_authority_group',
    ({ request }) => {
      const url = new URL(request.url);
      const la_codes = url.searchParams.getAll('la_codes');
      const requesting_la_code = url.searchParams.get('requesting_la_code');

      const values: { [key: string]: number } = {
        testla1: 10,
        testla2: 20,
        testla3: 30,
        // The parent LA of the mock care provider location (see
        // locations_data.care_provider_location.local_authority_code)
        E08000024: 40,
      };
      const group_members = la_codes.map((code) => ({
        code,
        display_name: `Name for ${code}`,
        metric_value: values[code] ?? null,
      }));
      const averageValues = group_members
        .filter(
          (member) =>
            member.code !== requesting_la_code && member.metric_value !== null
        )
        .map((member) => member.metric_value as number);

      return HttpResponse.json({
        group_members,
        custom_group_average:
          averageValues.length > 0
            ? averageValues.reduce((sum, value) => sum + value, 0) /
              averageValues.length
            : null,
        national_average: 15.5,
      });
    }
  ),

  http.get(api_root + '/metric_locations/regions/:region_code', () => {
    return HttpResponse.json(locations_data.region);
  }),

  http.get(api_root + '/metric_locations/countries/:code', () => {
    return HttpResponse.json(locations_data.country);
  }),
];
