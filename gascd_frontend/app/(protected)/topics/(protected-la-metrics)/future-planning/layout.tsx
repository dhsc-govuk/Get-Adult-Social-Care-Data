import { redirect } from 'next/navigation';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { LA_USER_TYPE } from '@/constants';

export default async function ProtectedLALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.locationType !== LA_USER_TYPE) {
    redirect('/');
  }

  return <>{children}</>;
}
