import { NextAuthOptions } from 'next-auth';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';

declare module 'next-auth' {
  interface Session {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    user: {
      locationType?: string;
      locationId?: string;
    };
  }
  interface Profile {
    extension_Location_Type?: string;
    extension_Location_ID?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: string;
    idToken?: string;
    locationType?: string;
    locationId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADB2CProvider({
      id: 'azure-ad-b2c-signin',
      name: 'Azure B2C Sign-in',
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      primaryUserFlow: process.env.AZURE_AD_B2C_USER_SIGN_IN as string,
      authorization: {
        params: {
          scope: 'openid offline_access profile',
        },
      },
      wellKnown: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_USER_SIGN_IN}`,
      profile: (profile) => {
        return { id: profile.sub };
      },
    }),
    AzureADB2CProvider({
      id: 'azure-ad-b2c-signup',
      name: 'Azure B2C Sign-up',
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      primaryUserFlow: process.env.AZURE_AD_B2C_USER_SIGN_UP as string,
      authorization: { params: { scope: 'openid offline_access profile' } },
      wellKnown: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_USER_SIGN_UP}`,
      profile: (profile) => {
        return { id: profile.sub };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.idToken = account.id_token as string;
        token.locationType = profile['extension_Location_Type'] as string;
        token.locationId = profile['extension_Location_ID'] as string;
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken as string;
      session.user.locationType = token.locationType as string;
      session.user.locationId = token.locationId as string;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken;

      return session;
    },
  },
};
