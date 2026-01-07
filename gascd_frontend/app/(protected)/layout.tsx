import { redirect } from 'next/navigation';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  addUserTelemetry();

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (!isUserRegistered(user)) {
    redirect('/not-registered');
  } else if (!user.selectedLocationId) {
    redirect('/location-select');
  }

  return <>{children}</>;
}
