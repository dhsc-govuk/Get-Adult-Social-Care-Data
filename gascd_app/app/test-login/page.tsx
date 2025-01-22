'use client';

import { signIn } from 'next-auth/react';

const handleSignUp = async (policy: string) => {
  await signIn('azure-ad-b2c', {
    callbackUrl: '/api/auth/test-dashboard',
    policy: policy,
  });
};

export default function Login() {
  return (
    <div>
      <h1>Sign Up</h1>
      <button
        onClick={() =>
          handleSignUp(process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW as string)
        }
      >
        Sign in with Azure AD B2C
      </button>
    </div>
  );
}
