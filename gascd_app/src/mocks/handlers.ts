import { http, HttpResponse } from 'msw';
import * as fs from 'fs';

const api_root = process.env.DATA_API_ROOT;
const metrics_metadata = JSON.parse(
  fs.readFileSync('src/data/mockResponses/metric_metadata.json', 'utf8')
);

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
    const percentage_metrics = metrics_metadata.filter(
      (item: any) => item.metric_data_type == 'Percentage'
    );
    return HttpResponse.json(percentage_metrics);
  }),
];
