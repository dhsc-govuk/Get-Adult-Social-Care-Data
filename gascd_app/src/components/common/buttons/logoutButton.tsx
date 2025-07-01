'use client';

import { signOut } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

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
    localStorage.clear();
    await signOut({ redirect: false });
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      // Force reload to reflect signout
      window.location.reload();
    }
  };

  return (
    <button
      className="govuk-button govuk-button--inverse"
      onClick={handleSignOut}
      style={{
        border: 'none',
        margin:0
      }}
    >
      Sign out
    </button>
  );
};

export default LogoutButton;
