import { redirect } from 'next/navigation';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';
import logger from '@/utils/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/authOptions';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  addUserTelemetry();
  const session = await getServerSession(authOptions);

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
