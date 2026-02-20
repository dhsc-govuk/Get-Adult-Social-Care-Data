import { redirect } from 'next/navigation';
import { addUserTelemetry } from '@/helpers/telemetry/usertelemetry';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await addUserTelemetry();

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (!isUserRegistered(user)) {
    redirect('/access-denied');
  } else if (!user.termsAccepted) {
    redirect('/accept-terms');
  } else if (![true, false].includes(user.marketingConsent as any)) {
    redirect('/consent');
  } else if (!user.selectedLocationId) {
    redirect('/location-select');
  }

  return <>{children}</>;
}
