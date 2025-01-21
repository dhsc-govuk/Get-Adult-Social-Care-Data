'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const handleSignOut = () => {
  const azureB2CLogoutUrl = `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/logout?p=${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}&post_logout_redirect_uri=/test-login`;

  signOut({
    callbackUrl: azureB2CLogoutUrl,
  });
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    router.push('/test-login'); // Redirect to custom login page
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      <button onClick={() => handleSignOut()}>Sign Out</button>
    </div>
  );
}
