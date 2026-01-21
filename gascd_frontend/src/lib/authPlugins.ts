import { genericOAuth, GenericOAuthConfig } from 'better-auth/plugins';
import { decodeJwt } from 'jose';

export const B2CPlugin = (): GenericOAuthConfig => {
  return {
    providerId: 'azure-ad-b2c-signin',
    clientId: process.env.AZURE_AD_CLIENT_ID as string,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
    discoveryUrl: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_USER_SIGN_IN}`,
    scopes: ['openid', 'offline_access', 'profile'],
    // No signup support through B2C
    disableImplicitSignUp: true,
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
        smartInsights: profile.extension_Smart_Insights,
        // B2C users are always members
        role: 'member',
        // B2C is allowed to write/rewrite the registeredEmail
        registeredEmail: profile.email,
      };
    },
  };
};

function generateNonce() {
  // Note - this is not actually required by One Login, but it is required by the OL Simulator
  const timestamp = Date.now();
  const random = Math.random() * 1000000;
  return String(timestamp) + String(random);
}

export const OneLoginPlugin = (): GenericOAuthConfig => {
  return {
    providerId: 'govuk-one-login',
    clientId: process.env.ONELOGIN_CLIENT_ID as string,
    clientSecret: process.env.ONELOGIN_CLIENT_SECRET as string,
    discoveryUrl: `${process.env.ONELOGIN_URL}/.well-known/openid-configuration`,
    scopes: ['openid', 'email'],
    pkce: true,
    authorizationUrlParams: {
      nonce: generateNonce(),
      vtr: JSON.stringify(['Cl.Cm.P0']),
    },
    // Ensure email for user is updated to match onelogin
    // (this is then checked against registeredEmail, which is not updated from onelogin)
    overrideUserInfo: true,
    // No automatic signup support through one login
    disableImplicitSignUp: true,
    mapProfileToUser: (profile) => {
      return {
        name: profile.email,
      };
    },
  };
};

export const getPlugins = (): GenericOAuthConfig[] => {
  const plugins: GenericOAuthConfig[] = [];
  if (process.env.ONELOGIN_URL) {
    plugins.push(OneLoginPlugin());
  }
  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_ENABLED) {
    plugins.push(B2CPlugin());
  }
  return plugins;
};

export const getOAuthConfig = () => {
  return genericOAuth({
    config: getPlugins(),
  });
};
