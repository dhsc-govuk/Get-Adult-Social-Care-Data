'use client';

import React, { useEffect, useState } from 'react';
import LogService from '@/services/logger/logService';
import { Session } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';

type Props = {
  session: Session | null;
};

const LogoutButton: React.FC<Props> = ({ session }) => {
  const [logoutUrl, setLogoutUrl] = useState('');

  useEffect(() => {
    const fetchB2CLogoutUrl = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.logoutUrl) setLogoutUrl(data.logoutUrl);
      } catch (error) {
        console.error('error fetching logout URL:', error);
      }
    };

    if (session) {
      const lastLoginMethod = (session.user as any).lastLoginMethod;
      if (lastLoginMethod == 'azure-ad-b2c-signin') {
        fetchB2CLogoutUrl();
      }
    }
  }, []);

  const handleSignOut = async (event: any) => {
    event.preventDefault();
    await LogService.logEvent('User logged out');
    localStorage.clear();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (logoutUrl) {
            window.location.href = logoutUrl;
          } else {
            window.location.href = '/signed-out';
          }
        },
      },
    });
  };

  return (
    <a
      href="#"
      className="rebranded-one-login-header__nav__link"
      onClick={handleSignOut}
    >
      <span className="rebranded-one-login-header__nav__link-content rebranded-one-login-header__nav__link-content--sign-out">
        Sign out
      </span>
    </a>
  );
};

export default LogoutButton;
