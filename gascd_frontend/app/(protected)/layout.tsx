import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
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
  await addUserTelemetry();

  if (!session || !session.user) {
    redirect('/login');
  } else if (!session.user.selectedLocationId) {
    redirect('/location-select');
  }

  return <>{children}</>;
}
