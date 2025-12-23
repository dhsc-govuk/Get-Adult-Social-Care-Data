import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect('/login');
  }

  return <>{children}</>;
}
