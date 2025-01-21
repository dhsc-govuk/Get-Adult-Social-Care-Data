'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn('azure-ad-b2c')}>
        Sign in with Azure AD B2C
      </button>
    </div>
  );
}
