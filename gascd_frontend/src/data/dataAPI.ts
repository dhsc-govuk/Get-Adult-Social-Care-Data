import { DataApiUnavailableError } from '@/lib/data-api-errors';
import { positiveInteger } from '@/lib/rate-limit-config';
import 'server-only';
import createClient, { Middleware } from 'openapi-fetch';
import { paths } from '@/metrics-api-schema';
import logger from '@/utils/logger';

export const API_SUFFIX = '/api';

const loggingMiddleware: Middleware = {
  async onResponse({ request, response, options }) {
    const { body, ...resOptions } = response;
    if (response.status === 429 || response.status === 503) {
      throw new DataApiUnavailableError(
        response.status,
        response.headers.get('Retry-After')
      );
    }
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

export const getAPIClient = (signal?: AbortSignal) => {
  const client = createClient<paths>({
    baseUrl: process.env.DATA_API_ROOT + API_SUFFIX,
    fetch: async (request: Request) => {
      const timeout = AbortSignal.timeout(
        positiveInteger('DATA_API_TIMEOUT_MS', 15000, 120000)
      );
      try {
        return await fetch(request, {
          signal: AbortSignal.any([
            request.signal,
            timeout,
            ...(signal ? [signal] : []),
          ]),
        });
      } catch (error) {
        throw new DataApiUnavailableError(503);
      }
    },
    headers: {
      'x-api-key': process.env.DATA_API_KEY,
    },
  });
  client.use(loggingMiddleware);
  return client;
};
