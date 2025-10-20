import { redirect } from 'next/navigation';
import { verifyAuthToken } from '../../src/helpers/auth/verifyAuthToken';
import logger from '@/utils/logger';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    // XXX does this need extra validation here?
    redirect('/login');
  }

  return <>{children}</>;
}
