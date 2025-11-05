import { http, HttpResponse } from 'msw';
import * as fs from 'fs';
import { metric_metadata } from '@/data/mockResponses/metric_metadata';

const api_root = process.env.DATA_API_ROOT;

export const handlers = [
  http.get(api_root + '/providers/:providerid', () => {
    return HttpResponse.json({
      provider_location_id: 'testcpl1',
      provider_location_name: 'Mock Care Provider Location',
      provider_id: 'testcp2',
      provider_name: 'Mock Care Provider',
      la_code: 'E08000024',
      la_name: 'Sunderland',
      region_code: 'E12000001',
      region_name: 'North East',
      country_code: 'E92000001',
      country_name: 'England',
      load_date_time: '2025-03-04T14:36:18.510Z',
    });
  }),

  http.get(api_root + '/metadata/metrics', () => {
    const percentage_metrics = metric_metadata.filter(
      (item) => item.metric_data_type === 'Percentage'
    );
    return HttpResponse.json(percentage_metrics);
  }),

  http.get(api_root + '/locations', () => {
      {
        metric_type: 'Capacity Tracker',
        metric_location_type: 'Care provider location',
        user_access_location_type: 'Care provider location',
        user_access_restricted_flag: 1,
        metric_location_id: 'testcpl1',
        metric_location_name: 'Test Care Provider Location 2',
        user_access_location_id: 'testcpl2',
        load_date_time: '2025-08-29T09:20:27.190Z',
      },
    ];
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
    return HttpResponse.json({
      id: 'testcpl1',
      display_name: 'Mock Care Provider Location',
      geo_data: {
        latitude: 54.8798077426683,
        longitude: -1.4036740441143998,
      },
      provider_id: 'testcp2',
      provider_name: 'Mock Care Provider',
      nominated_individual: 'John Doe',
      local_authority_id: 'E08000024',
    });
  }),

  http.get(api_root + '/metric_location/district/:code', () => {
    return HttpResponse.json({
      id: 'E05001171',
      display_name: 'Silksworth',
      geo_data: {
        latitude: 54.8798077426683,
        longitude: -1.4036740441143998,
        bbox: [
          [-1.4247455227942605, 54.86912871879158],
          [-1.4247455227942605, 54.88889158836046],
          [-1.3785352992918785, 54.86912871879158],
          [-1.3785352992918785, 54.88889158836046],
        ]
      },
      local_authority_id: 'E08000024',
    });
  }),

  http.get(api_root + '/metric_location/local_authorities/:code', () => {
    return HttpResponse.json({
      id: 'E08000024',
      display_name: 'Sunderland',
      geo_data: {
        latitude: 54.880445953877775,
        longitude: -1.4519587820223236,
        bbox: [
          [-1.5688915330791782, 54.944529934401686],
          [-1.5688915330791782, 54.79905189140416],
          [-1.346135332338452, 54.944529934401686],
          [-1.346135332338452, 54.79905189140416],
        ]
      },
      region_id: 'E12000001',
    });
  }),

  http.get(api_root + '/metric_location/regions/:code', () => {
    return HttpResponse.json({
      id: 'E12000001',
      display_name: 'North East',
      geo_data: {
        latitude: 55.02208006843618,
        longitude: -1.9024409814666763,
        bbox: [
          [-2.6897904346299817, 54.45113757928627],
          [-2.6897904346299817, 55.81166415447148],
          [-0.7883089724322202, 54.45113757928627],
          [-0.7883089724322202, 55.81166415447148],
        ]
      },
      country_id: 'E92000001',
    });
  }),
];
