import NextAuth, { NextAuthOptions } from 'next-auth';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';
import { cookies } from 'next/headers';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    idToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: string;
    accessToken?: string;
    idToken?: string;
    // role?: string; - TODO: can we have role here?
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    AzureADB2CProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW as string,
      authorization: { params: { scope: 'openid offline_access profile' } },
      wellKnown: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}`,
      profile: (profile) => {
        console.log('THE PROFILE', profile);

        return {
          id: profile.sub,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token as string;
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
