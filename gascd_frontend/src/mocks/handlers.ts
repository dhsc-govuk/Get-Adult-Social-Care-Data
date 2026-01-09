import { http, HttpResponse } from 'msw';
import { metric_metadata } from '@/data/mockResponses/metric_metadata';
import { locations_data } from '@/data/mockResponses/locations_data';
import { organisation_data } from '@/data/mockResponses/organisation_data';
import { metric_filters_data } from '@/data/mockResponses/metric_filters_data';

const api_root = process.env.DATA_API_ROOT;

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

  http.get<{ metric_id: string }>(
    api_root + '/metrics/:metric_id',
    ({ request, params }) => {
      const url = new URL(request.url);
      const location_ids =
        url.searchParams.get('location_ids')?.split(',') || [];
      const metric_id = params.metric_id;

      let metrics: any[] = [];

      for (let location_id of location_ids) {
        let location_type = '';
        if (location_id.startsWith('E0')) {
          location_type = 'LA';
        } else if (location_id.startsWith('E1')) {
          location_type = 'Regional';
        } else if (location_id.startsWith('E9')) {
          location_type = 'National';
        } else {
          location_type = 'Care provider location';
        }

        let fake_metric = {
          metric_id: metric_id,
          location_id: location_id,
          series_start_date: '01/01/2024',
          series_frequency: 'Daily',
          values: ['100'],
        };
        metrics.push(fake_metric);
      }

      return HttpResponse.json(metrics);
    }
  ),

  http.get(
    api_root + '/metric_location/cp_locations/:care_provider_code',
    () => {
      return HttpResponse.json(locations_data.care_provider_location);
    }
  ),

  http.get(api_root + '/metric_location/district/:code', () => {
    return HttpResponse.json(locations_data.district);
  }),

  http.get(api_root + '/metric_location/local_authorities/:code', () => {
    return HttpResponse.json(locations_data.local_authority);
  }),

  http.get(api_root + '/metric_location/regions/:code', () => {
    return HttpResponse.json(locations_data.region);
  }),

  http.get(api_root + '/metric_location/countries/:code', () => {
    return HttpResponse.json(locations_data.country);
  }),
];
