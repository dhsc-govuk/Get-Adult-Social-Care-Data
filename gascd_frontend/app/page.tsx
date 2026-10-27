import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';

// Service entry point. The GOV.UK start page links here, so an unauthenticated
// visitor is sent to /whoami to sign in or start the sign-up flow, rather than
// straight to One Login, which would bypass sign-up for new LA users.
// Anyone with a session carries on to /home as before.
export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/whoami');
  }

  redirect('/home');
}
