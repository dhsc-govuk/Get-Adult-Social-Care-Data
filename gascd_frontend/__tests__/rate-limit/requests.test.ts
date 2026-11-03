// @vitest-environment node
import { parseMetricIds, readMetricRequest } from '@/lib/metric-request';
import {
  withDataApiErrors,
  DataApiUnavailableError,
} from '@/lib/data-api-errors';

it('rejects oversized and malformed work before deduplicating', () => {
  expect(parseMetricIds([' a ', 'a', 'b'], 3)).toEqual(['a', 'b']);
  for (const input of [null, 'a', [], [1], ['bad-id'], ['a', 'a', 'a', 'a']]) {
    expect(() => parseMetricIds(input, 3)).toThrow();
  }
});
it('does not return partially accumulated metrics when a later upstream call is throttled', async () => {
  const fetchMetric = vi
    .fn()
    .mockResolvedValueOnce({ value: 1 })
    .mockRejectedValueOnce(new DataApiUnavailableError(429, '9'));
  const handler = withDataApiErrors(async () => {
    const metrics = [];
    for (let index = 0; index < 2; index++) metrics.push(await fetchMetric());
    return Response.json(metrics);
  });
  const response = await handler();
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('9');
  expect(await response.json()).toMatchObject({ code: 'RATE_LIMITED' });
});
it('bounds streamed body bytes even without a Content-Length header', async () => {
  const request = new Request('http://localhost/api/get_metric_data', {
    method: 'POST',
    body: JSON.stringify({ metric_ids: ['a'.repeat(100)] }),
  });
  await expect(readMetricRequest(request, 32)).rejects.toThrow('too large');
});
it('does not invent a retry window for API concurrency rejection', async () => {
  const response = await withDataApiErrors(async () => {
    throw new DataApiUnavailableError(429);
  })();
  expect(response.headers.has('Retry-After')).toBe(false);
});
