import { http, HttpResponse } from 'msw';
import { metric_metadata } from '@/data/mockResponses/metric_metadata';
import { locations_data } from '@/data/mockResponses/locations_data';
import { organisation_data } from '@/data/mockResponses/organisation_data';

const api_root = process.env.DATA_API_ROOT;

export const handlers = [
  http.get(api_root + '/organisation/care_provider/:code', () => {
    return HttpResponse.json(organisation_data);
  }),

  http.get(api_root + '/metadata/metrics', () => {
    const percentage_metrics = metric_metadata.filter(
      (item) => item.metric_data_type === 'Percentage'
    );
    return HttpResponse.json(percentage_metrics);
  }),

  http.get(api_root + '/locations', () => {
    const locations = {
      metric_type: 'Capacity Tracker',
      metric_location_type: 'Care provider location',
      user_access_location_type: 'Care provider location',
      user_access_restricted_flag: 1,
      metric_location_id: 'testcpl1',
      metric_location_name: 'Test Care Provider Location 2',
      user_access_location_id: 'testcpl2',
      load_date_time: '2025-08-29T09:20:27.190Z',
    };
    return HttpResponse.json(locations);
  }),

  http.get<{ la_code: string }>(
    api_root + '/localauthorities/:la_code',
    ({ params }) => {
      const la_code = params.la_code;
      const la_data = {
        la_code: la_code,
        la_name: 'Mock LA',
        region_code: 'E12000001',
        region_name: 'North East',
        country_code: 'E92000001',
        country_name: 'England',
      };
      return HttpResponse.json(la_data);
    }
  ),

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
          metric_date_type: 'Daily',
          metric_date: '01/01/2024',
          location_type: location_type,
          location_id: location_id,
          numerator: 'numerator',
          denominator: 'denominator',
          multiplier: 'multiplier',
          data_point: '100',
          load_date_time: '2025-08-29T09:20:26.193Z',
        };
        metrics.push(fake_metric);
      }

      return HttpResponse.json(metrics);
    }
  ),

  http.get(api_root + '/metric_location/cp_locations/:code', () => {
    return HttpResponse.json(locations_data.care_provider_location);
  }),

  http.get(api_root + '/metric_location/district/:code', () => {
    return HttpResponse.json(locations_data.district);
  }),

  http.get(api_root + '/metric_location/local_authorities/:code', () => {
    return HttpResponse.json(locations_data.local_authority);
  }),

  http.get(api_root + '/metric_location/regions/:code', () => {
    return HttpResponse.json(locations_data.region);
  }),
];
