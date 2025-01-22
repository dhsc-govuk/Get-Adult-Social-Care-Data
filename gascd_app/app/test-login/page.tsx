'use client';

import { signIn } from 'next-auth/react';

// const handleSignUp = async (policy: string) => {
//   await signIn('azure-ad-b2c', {
//     callbackUrl: '/api/auth/test-dashboard',
//     policy: policy,
//   });
// };
const handleSignUp = () => {
  signIn('azure-ad-b2c-signup');
};
const handleSignIn = () => {
  signIn('azure-ad-b2c-signin');
};

export default function Login() {
  return (
    <div>
      <div>
        <h1>Sign Up</h1>
        <button onClick={() => handleSignUp()}>
          Sign up with Azure AD B2C
        </button>
      </div>
      <div>
        <h1>Sign In</h1>
        <button onClick={() => handleSignIn()}>
          Sign in with Azure AD B2C
        </button>
      </div>
    </div>
  );
}
