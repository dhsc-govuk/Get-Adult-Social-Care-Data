import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import { LA_USER_TYPE } from '@/constants';

// Guards the future planning pages that remain LA only. The theme itself, and
// the Department for Education pages within it, are open to care providers too,
// so this layout sits over the LA only pages rather than the whole theme.
export default async function ProtectedLALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user?.locationType !== LA_USER_TYPE) {
    redirect('/');
  }

  return <>{children}</>;
}
