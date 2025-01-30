'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const SignOutButton: React.FC = () => {
  const [logoutUrl, setLogoutUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const tenant = 'DHSCGASCAuthDev';
    const policy = 'B2C_1_GASCD_User_SignIn';
    const postLogoutRedirectUri = 'http://localhost:3000';

    if (tenant && policy && postLogoutRedirectUri) {
      setLogoutUrl(
        `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
          postLogoutRedirectUri
        )}`
      );
    } else {
      console.error('Missing Azure B2C environment variables');
    }
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    if (logoutUrl) {
      router.push(logoutUrl);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '19px',
        cursor: 'pointer',
        textDecoration: 'underline',
      }}
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
