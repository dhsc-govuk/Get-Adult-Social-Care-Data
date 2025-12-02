'use client';

import React, { useEffect, useState } from 'react';
import LogService from '@/services/logger/logService';
import { authClient } from '@/lib/auth-client';

const LogoutButton: React.FC = () => {
  const [logoutUrl, setLogoutUrl] = useState('');

  useEffect(() => {
    const fetchLogoutUrl = async () => {
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

    fetchLogoutUrl();
  }, []);

  const handleSignOut = async () => {
    await LogService.logEvent('User logged out');
    localStorage.clear();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (logoutUrl) {
            window.location.href = logoutUrl;
          } else {
            window.location.href = '/login';
          }
        },
      },
    });
  };

  return (
    <button
      className="govuk-button govuk-button--inverse"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
};

export default LogoutButton;
