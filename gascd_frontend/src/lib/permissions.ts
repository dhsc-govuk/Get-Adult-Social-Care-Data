import { cache } from 'react';
import { User, auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    return session?.user;
  }
});

export const isUserRegistered = (user: User) => {
  if (!user) {
    return false;
  } else if (user.role !== 'member') {
    console.debug('User has no member role');
    return false;
  } else if (user.email !== user.registeredEmail) {
    console.debug(
      'Registered email mismatch',
      user.email,
      user.registeredEmail
    );
    return false;
  } else {
    return true;
  }
};
