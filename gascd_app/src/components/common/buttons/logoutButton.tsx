'use client';

import { signOut } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const LogoutButton: React.FC = () => {
  const [logoutUrl, setLogoutUrl] = useState('');


  useEffect(() => {
    const fetchLogoutUrl = async () => {
      try {
        const response = await fetch("/api/auth/logout", { 
          method: "POST", 
          headers: {
          "Content-Type": "application/json",
        },
       });
        
        const data = await response.json();
        if(data.logoutUrl) setLogoutUrl(data.logoutUrl);
      }
      catch (error){
        console.error("error fetching logout URL:", error)
      }
    }

    fetchLogoutUrl();
  }, []);

  const handleSignOut = async () => {    
    await signOut({ redirect: false });
    if (logoutUrl) {
      window.location.href = logoutUrl
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

export default LogoutButton;
