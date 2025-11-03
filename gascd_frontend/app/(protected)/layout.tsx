import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/authOptions';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';
import logger from '@/utils/logger';
import { trace } from '@opentelemetry/api';
import { ATTR_ENDUSER_ID } from '@opentelemetry/semantic-conventions/incubating';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    let activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.setAttribute(ATTR_ENDUSER_ID, session.user.id);
    }
  }

  if (process.env.LOCAL_AUTH == 'true') {
    if (session?.user) {
      // Skip jwt validation if doing local auth
      return <>{children}</>;
    }
  }

  if (!session || !session.idToken) {
    redirect('/login');
  }

  try {
    await verifyAuthToken(session.idToken);
  } catch (error) {
    logger.error('Error verifying token:', error);
    redirect('/login');
  }
  return <>{children}</>;
}
