'use client';

import React, { useActionState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { authClient } from '@/lib/auth-client';

const LoginPage: React.FC = () => {
  const handleSubmit = async () => {
    const { data, error } = await authClient.signIn.oauth2({
      providerId: 'govuk-one-login',
      callbackURL: '/home',
    });
    if (error) {
      return {
        error:
          'Sorry, there is a problem with the service. Please try again later.',
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <>
      <Layout
        title="Login"
        showLoginInformation={false}
        currentPage="login"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Get adult social care data</h1>

            <form action={formAction}>
              <button
                type="submit"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Sign in with GOV.UK One Login'}
                {!isPending && (
                  <svg
                    className="govuk-button__start-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17.5"
                    height="19"
                    viewBox="0 0 33 40"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M0 0h13l20 20-20 20H0l20-20z"
                    />
                  </svg>
                )}
              </button>
              {state && <p className="govuk-error-message">{state.error}</p>}
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
