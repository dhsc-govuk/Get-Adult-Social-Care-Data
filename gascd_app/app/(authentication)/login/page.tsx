'use client';

import React, { useCallback, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import StandardButton from '../../../src/components/common/buttons/functionality/standard-button/StandardButton';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    signIn('azure-ad-b2c-signin', { callbackUrl: '/home' });
  };

  return (
    <>
      <title>Log in - Get adult social care data - GOV.UK</title>
      <Layout
        showLoginInformation={false}
        currentPage="login"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Sign In</h1>
            <Link href="/home" passHref>
              <StandardButton
                buttonString="Login"
                buttonFunction={handleSubmit}
              ></StandardButton>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
