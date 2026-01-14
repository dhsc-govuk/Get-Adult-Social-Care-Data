import type { NextConfig } from 'next';

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
  output: 'standalone',
};

export default nextConfig;
