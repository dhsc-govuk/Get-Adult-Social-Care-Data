import { redirect } from 'next/navigation';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  addUserTelemetry();

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
