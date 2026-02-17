import type { NextConfig } from 'next';

// Recommended CSP config from
// https://nextjs.org/docs/15/app/guides/content-security-policy#without-nonces
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' js.monitor.azure.com az416426.vo.msecnd.net;
    connect-src 'self' *.applicationinsights.azure.com *.applicationinsights.microsoft.com *.services.visualstudio.com *.monitor.azure.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`;

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@azure/monitor-opentelemetry',
    '@opentelemetry/api',
    '@opentelemetry/resources',
    '@opentelemetry/sdk-metrics',
    '@opentelemetry/sdk-node',
    '@opentelemetry/sdk-trace-base',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/exporter-jaeger',
    '@opentelemetry/instrumentation-winston',
    '@opentelemetry/auto-instrumentations-node',
  ],
  logging: {
    incomingRequests: false,
  },
  poweredByHeader: false,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
