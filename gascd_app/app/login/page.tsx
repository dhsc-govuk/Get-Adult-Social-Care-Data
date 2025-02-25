'use client';

import React, { useCallback, useState } from 'react';
import Layout from '../../src/components/common/layout/Layout';
import StandardButton from '../../src/components/common/buttons/functionality/standard-button/StandardButton';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    signIn('azure-ad-b2c-signin', { callbackUrl: '/home' });
  };

  return (
    <Layout showLoginInformation={false} currentPage="login" showNavBar={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">Sign In</h1>
          <fieldset className="govuk-fieldset">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="email">
                Enter your email address
              </label>
              <input
                className="govuk-input govuk-input--width-20"
                type="text"
                id="email"
                onChange={(e: any) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="password">
                Enter your password
              </label>
              <input
                className="govuk-input govuk-input--width-20"
                type="password"
                id="password"
              />
            </div>
          </fieldset>
          <Link href="/home" passHref>
            <StandardButton
              buttonString="Login"
              buttonFunction={handleSubmit}
            ></StandardButton>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
