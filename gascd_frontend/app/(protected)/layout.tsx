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
      // Note - this would be better handled in middleware to apply to all telemetry
      activeSpan.setAttribute(ATTR_ENDUSER_ID, session.user.id);
      if (session.user.locationId) {
        activeSpan.setAttribute('userOrganisationId', session.user.locationId);
      }
      if (session.user.locationType) {
        activeSpan.setAttribute(
          'userOrganisationType',
          session.user.locationType
        );
      }
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
