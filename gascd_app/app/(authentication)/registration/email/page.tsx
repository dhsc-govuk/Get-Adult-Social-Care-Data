'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import { signIn } from 'next-auth/react';
import LabelledInput from '@/components/common/input/LabelledInput';

const RegisterEmailPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn('azure-ad-b2c-signup', { callbackUrl: '/register/confirm-code' });
  };

  return (
    <>
      <title>Sign in to Get adult social care data or request access</title>
      <Layout showLoginInformation={false} currentPage={'register-email'}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Sign in to Get adult social care data or request access
            </h1>

            <form className="form" onSubmit={handleSubmit} method="post">
              <div className="govuk-form-group">
                <LabelledInput
                  eventName={'email'}
                  inputId={'register-email'}
                  ariaLabel={'Enter email address'}
                >
                  Enter your email address
                </LabelledInput>
              </div>

              <button className="govuk-button" type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default RegisterEmailPage;
