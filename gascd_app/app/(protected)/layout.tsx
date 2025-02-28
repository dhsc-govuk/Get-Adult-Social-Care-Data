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
    redirect('/login');
  }
  return <>{children}</>;
}
