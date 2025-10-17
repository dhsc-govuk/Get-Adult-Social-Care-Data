import { redirect } from 'next/navigation';
//import { getServerSession } from 'next-auth/next';
//import { authOptions } from '../api/auth/authOptions';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';
import logger from '@/utils/logger';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const session = await getServerSession(authOptions);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (process.env.LOCAL_AUTH == 'true') {
    if (session?.user) {
      // Skip jwt validation if doing local auth
      return <>{children}</>;
    }
  }

  if (!session || !session.user) {
    redirect('/login');
  }

  return <>{children}</>;
}
