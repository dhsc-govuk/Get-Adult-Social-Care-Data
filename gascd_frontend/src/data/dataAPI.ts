//import 'server-only';
import createClient from 'openapi-fetch';
import { paths } from '@/metrics-api-schema';

export const APIClient = createClient<paths>({
  baseUrl: process.env.DATA_API_ROOT,
  headers: {
    'x-api-key': process.env.DATA_API_KEY,
  },
});
