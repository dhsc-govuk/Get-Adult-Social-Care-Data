import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Supply staging sessions in an untracked JSON file: [{"cookie":"...","metric_ids":["total_population"]}].
// One entry per distinct user is needed to measure quotas independently of aggregate load.
const users = JSON.parse(open(__ENV.USERS_FILE));
const baseUrl = __ENV.BASE_URL;
if (!baseUrl || !Array.isArray(users) || !users.length)
  throw new Error('BASE_URL and USERS_FILE are required');
const rejected = new Counter('rate_limited');
const unavailable = new Counter('service_unavailable');
const successfulLatency = new Trend('successful_data_duration', true);

export const options = {
  scenarios: {
    authenticated_data: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || users.length),
      duration: __ENV.DURATION || '2m',
    },
  },
  thresholds: { checks: ['rate==1'] },
};

export default function () {
  const user = users[(__VU - 1) % users.length];
  const response = http.post(
    `${baseUrl}/api/get_metric_data`,
    JSON.stringify({
      metric_ids: user.metric_ids || ['total_population'],
      query_type: 'UserQuery',
    }),
    {
      headers: { Cookie: user.cookie, 'Content-Type': 'application/json' },
      tags: { name: 'metric-data' },
    }
  );
  check(response, {
    'authenticated response or controlled overload': (r) =>
      [200, 429, 503].includes(r.status),
    'successful data is an array': (r) =>
      r.status !== 200 || Array.isArray(r.json()),
  });
  if (response.status === 429) rejected.add(1);
  if (response.status === 503) unavailable.add(1);
  if (response.status === 200) successfulLatency.add(response.timings.duration);
  sleep(Number(__ENV.PAUSE_SECONDS || 1));
}
