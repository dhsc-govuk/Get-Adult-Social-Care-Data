import { betterFetch } from '@better-fetch/fetch';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import logger from '@/utils/logger';

export function generateNonce() {
  const timestamp = Date.now();
  const random = Math.random() * 1000000;
  return String(timestamp) + String(random);
}

export async function verifyIdToken(
  idToken: string,
  discoveryUrl: string,
  clientId: string
) {
  // Fetch OIDC Config
  const { data, error } = await betterFetch<any>(discoveryUrl);

  if (!data?.jwks_uri) {
    logger.error('No JWKS URI found in discovery document');
    throw new Error('No JWKS URI found in discovery document');
  }

  // Setup Key Set
  const JWKS = createRemoteJWKSet(new URL(data.jwks_uri), {
    cacheMaxAge: 600000, // cache keysets for 10mins
  });

  // Verify Signature and Claims
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: data.issuer,
    audience: clientId,
  });

  return payload;
}

export async function getUserInfo(discoveryUrl: string, accessToken: string) {
  // Largely adapted from better auth
  // better-auth/plugins/generic-oauth/routes
  const { data, error } = await betterFetch<{ userinfo_endpoint: string }>(
    discoveryUrl
  );

  if (!data?.userinfo_endpoint) {
    logger.error('No User Info URI found in discovery document');
    throw new Error('No User Info URI found in discovery document');
  }

  const userInfo = await betterFetch<{
    email: string;
    sub?: string | undefined;
    email_verified: boolean;
  }>(data.userinfo_endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return {
    id: userInfo.data?.sub ?? '',
    email: userInfo.data?.email,
    emailVerified: userInfo.data?.email_verified ?? false,
    ...userInfo.data,
  };
}
