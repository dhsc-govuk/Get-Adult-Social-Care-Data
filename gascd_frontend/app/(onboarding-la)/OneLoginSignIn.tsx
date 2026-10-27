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
 * Login identifies the person by account. Rendered above the form so it is
 * visible without scrolling; it deliberately has no heading so the page's h1
 * stays first in document order.
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
      errorCallbackURL: withBasePath('/access-denied'),
    });
    if (error) {
      setError(ERROR_MSG);
      setIsPending(false);
    }
  };

  return (
    <div className="govuk-inset-text govuk-!-margin-top-0">
      <p className="govuk-body">
        <strong>Already registered?</strong> You do not need to answer this
        question.
      </p>
      <button
        type="button"
        className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
        data-module="govuk-button"
        disabled={isPending}
        onClick={signIn}
      >
        {isPending ? 'Signing in...' : 'Sign in with GOV.UK One Login'}
      </button>
      {error && (
        <p className="govuk-error-message govuk-!-margin-top-2" role="alert">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
    </div>
  );
};

export default OneLoginSignIn;
