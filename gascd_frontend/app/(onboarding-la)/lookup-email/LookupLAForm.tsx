'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitOnboarding } from '@/onboarding/client';
import type { LookupEmailFormData, OnboardingResult } from '@/onboarding/types';

const BACK_LINK = '/whoami';

const LookupLAForm: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<OnboardingResult<LookupEmailFormData>>();
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState(undefined);

    const formData = new FormData(event.currentTarget);
    const result = await submitOnboarding<LookupEmailFormData>(
      '/api/onboarding/lookup-email',
      { regmail: formData.get('regmail') }
    );

    if (result.type === 'navigate') {
      router.push(result.path);
      return;
    }
    if (result.type === 'external') {
      window.location.assign(result.url);
      return;
    }

    setState(result);
    setIsPending(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 className="govuk-fieldset__heading">Check your email here</h1>
        </legend>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="la-user-email">
            Email address
          </label>
          <p
            id="la-user-email-hint"
            className="govuk-hint govuk-!-margin-top-0"
          >
            It will be checked against a list of approved LA domains.
          </p>
          <input
            className="govuk-input govuk-!-width-one-third"
            id="la-user-email"
            name="regmail"
            type="email"
            spellCheck="false"
            autoComplete="regmail"
            aria-describedby="la-user-email-hint"
          />
        </div>
      </fieldset>

      {/* ------------------------------------- */}
      <div className="govuk-button-group govuk-!-margin-top-6">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          disabled={isPending}
        >
          Continue
        </button>

        {state?.type === 'error' && state.description && (
          <p className="govuk-error-message">{state.description}</p>
        )}

        <Link href={BACK_LINK} className="govuk-link">
          Cancel and go back
        </Link>
      </div>
    </form>
  );
};

export default LookupLAForm;
