import 'server-only';
import createClient, { Middleware } from 'openapi-fetch';
import { paths } from '@/metrics-api-schema';
import logger from '@/utils/logger';

const loggingMiddleware: Middleware = {
  async onResponse({ request, response, options }) {
    const { body, ...resOptions } = response;
    if (!response.ok) {
      logger.error('Unexpected response from Data API', {
        status_code: response.status,
        status: response.statusText,
        request_url: request.url,
      });
    }
    return undefined;
  },
  async onError({ error }) {
    logger.error('Error in Data API request', { cause: error });
    return undefined;
  },
};

export const getAPIClient = () => {
  const client = createClient<paths>({
    baseUrl: process.env.DATA_API_ROOT,
    headers: {
      'x-api-key': process.env.DATA_API_KEY,
    },
  });
  client.use(loggingMiddleware);
  return client;
};
