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

  http.get(api_root + '/metric_locations/regions/:region_code', () => {
    return HttpResponse.json(locations_data.region);
  }),

  http.get(api_root + '/metric_locations/countries/:code', () => {
    return HttpResponse.json(locations_data.country);
  }),
];
