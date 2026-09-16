'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { withBasePath } from '@/lib/basePath';

const ERROR_MSG =
  'Sorry, there is a problem with the service. Please try again later.';

/**
 * Direct sign-in for people who already have an account. Starts GOV.UK One
 * Login without requesting sign-up, so an unknown account lands on Access
 * Denied rather than creating a user. Works for both user types because One
 * Login identifies the person by account.
 */
const OneLoginSignIn: React.FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setIsPending(true);
    setError(null);
    const { error } = await authClient.signIn.oauth2({
      providerId: 'govuk-one-login',
      callbackURL: withBasePath('/home'),
    });
    if (error) {
      setError(ERROR_MSG);
      setIsPending(false);
    }
  };

  return (
    <div className="govuk-!-margin-top-6">
      <h2 className="govuk-heading-m">Already registered?</h2>
      <p className="govuk-body">
        If you already have access to this service you do not need to answer
        these questions.
      </p>
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
        disabled={isPending}
        onClick={signIn}
      >
        {isPending ? 'Signing in...' : 'Sign in with GOV.UK One Login'}
      </button>
      {error && (
        <p className="govuk-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
    </div>
  );
};

export default OneLoginSignIn;
