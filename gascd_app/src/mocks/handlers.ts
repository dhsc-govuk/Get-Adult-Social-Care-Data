import { http, HttpResponse } from 'msw';

const api_root = process.env.DATA_API_ROOT;

export const handlers = [
  http.get(api_root + '/providers/:providerid', () => {
    return HttpResponse.json({
      provider_location_id: 'testcpl2',
      provider_location_name: 'Mock Care Provider Location 2',
      provider_id: 'testcp2',
      provider_name: 'Mock Care Provider 2',
      la_code: 'E08000024',
      la_name: 'Sunderland',
      region_code: 'E12000001',
      region_name: 'North East',
      country_code: 'E92000001',
      country_name: 'England',
      load_date_time: '2025-03-04T14:36:18.510Z',
    });
  }),
];
