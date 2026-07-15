import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) throw new Error('BASE_URL env var is required');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 400 },
    { duration: '3m', target: 400 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  group('landing', () => {
    const res = http.get(`${BASE_URL}/`, { redirects: 0 });
    check(res, {
      'landing responded (2xx/3xx)': (r) => r.status >= 200 && r.status < 400,
    });
  });

  group('health', () => {
    const res = http.get(`${BASE_URL}/api/checks/live`);
    check(res, { 'liveness 200': (r) => r.status === 200 });
  });

  sleep(Math.random() + 0.5);
}
