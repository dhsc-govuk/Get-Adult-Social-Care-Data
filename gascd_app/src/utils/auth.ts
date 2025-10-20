import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
  //emailAndPassword: {
  //  enabled: true,
  //},
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'azure-ad-b2c-signin',
          clientId: process.env.AZURE_AD_CLIENT_ID as string,
          clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
          discoveryUrl: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_USER_SIGN_IN}`,
          scopes: ['openid', 'offline_access', 'profile'],
        },
      ],
    }),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});
