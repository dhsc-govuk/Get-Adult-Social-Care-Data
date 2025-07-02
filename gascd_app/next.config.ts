import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    AZURETENANTNAME: process.env.AZURE_AD_TENANT_NAME,
    AZURESIGNIN: process.env.AZURE_AD_B2C_USER_SIGN_IN,
    LOGOUTURL: process.env.NEXTAUTH_URL,
  },
  output: 'standalone'
};

export default nextConfig;
