import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) throw new Error('BASE_URL env var is required');

// Walks the initial OAuth redirect but stops at the GOV.UK sign-in page (can't
// script that headlessly). Measures the frontend's redirect-to-provider hop
// under load, which is where better-auth + User_DB get exercised on cold hits.
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '3m', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  group('sign-in redirect', () => {
    const res = http.post(`${BASE_URL}/api/auth/sign-in/oauth2`, JSON.stringify({ providerId: 'one-login' }), {
      headers: { 'content-type': 'application/json' },
      redirects: 0,
    });
    check(res, {
      'redirect returned': (r) => r.status === 200 || r.status === 302,
      'redirect target present': (r) =>
        (r.json && r.json('url')) || r.headers['Location'],
    });
  });

  sleep(Math.random() + 0.3);
}
