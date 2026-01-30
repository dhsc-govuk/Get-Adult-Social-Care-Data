import 'server-only';

import { cache } from 'react';
import { User, auth } from '@/lib/auth';
import { headers } from 'next/headers';
import logger from '@/utils/logger';

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
    logger.error('User has no member role', {
      userid: user.id,
    });
    return false;
  } else if (user.email.toLowerCase() !== user.registeredEmail?.toLowerCase()) {
    logger.error('Registered email mismatch', {
      userid: user.id,
    });
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
