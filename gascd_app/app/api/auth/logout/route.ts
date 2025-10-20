import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorised: No active session' },
      { status: 401 }
    );
  }

  const tenant = process.env.AZURE_AD_TENANT_NAME;
  const userFlow = process.env.AZURE_AD_B2C_USER_SIGN_IN;
  const logoutRedirectUrl = process.env.AZURE_AD_B2C_LOGOUT_URL;
  const idToken = session?.idToken as string;

  if (!tenant || !userFlow || !logoutRedirectUrl) {
    logger.warn('Missing environment variables for azure logout URL');
    return NextResponse.json(
      {
        error: 'Missing required environment variables',
      },
      { status: 404 }
    );
  }

  const logoutUrl = `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${userFlow}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(logoutRedirectUrl)}&id_token_hint=${idToken}`;
  return NextResponse.json({ logoutUrl });
}
