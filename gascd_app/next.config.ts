import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    AZURETENANTNAME: process.env.AZURE_AD_TENANT_NAME,
    AZURESIGNIN: process.env.AZURE_AD_B2C_USER_SIGN_IN,
    LOGOUTURL: process.env.NEXTAUTH_URL,
  },
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
  ],
  logging: {
    incomingRequests: false,
  },
  output: 'standalone',
};

export default nextConfig;
