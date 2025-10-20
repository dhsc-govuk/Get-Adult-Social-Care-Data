import { genericOAuth } from 'better-auth/plugins';
import { decodeJwt } from 'jose';

export const B2CPlugin = () => {
  return genericOAuth({
    config: [
      {
        providerId: 'azure-ad-b2c-signin',
        clientId: process.env.AZURE_AD_CLIENT_ID as string,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
        discoveryUrl: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_USER_SIGN_IN}`,
        scopes: ['openid', 'offline_access', 'profile'],
        // Ensure location details after updated on every login
        overrideUserInfo: true,
        // Custom userinfo method, to deal with B2Cs list of emails
        getUserInfo: async (tokens) => {
          if (tokens.idToken) {
            const decoded = decodeJwt(tokens.idToken) as {
              sub: string;
              emails: string[];
              emailVerified: boolean;
            };
            if (decoded) {
              if (decoded.sub && decoded.emails) {
                return {
                  id: decoded.sub,
                  email: decoded.emails[0],
                  ...decoded,
                };
              }
            }
          }
          return null;
        },
        // Map B2C location IDs to our internal fields
        mapProfileToUser: (profile) => {
          return {
            id: profile.id,
            locationId: profile.extension_Location_ID,
            locationType: profile.extension_Location_Type,
          };
        },
      },
    ],
  });
};
