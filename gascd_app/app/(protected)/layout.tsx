import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/authOptions';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.idToken) {
    redirect('/login');
  }

  try {
    await verifyAuthToken(session.idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    if (process.env.NODE_ENV == 'production') {
      // Always force jwt verification in production
      redirect('/login');
    } else if (process.env.LOCAL_AUTH) {
      // Ignore if using local auth in development mode
    } else {
      redirect('/login');
    }
  }
  return <>{children}</>;
}
