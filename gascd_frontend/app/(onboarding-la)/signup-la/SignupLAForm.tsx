'use client';

import { ACCEPTABLE_EMAIL_DOMAINS } from '@/lib/domain-check';
import { submitOnboarding } from '@/onboarding/client';
import type { OnboardingResult, SignupLAFormData } from '@/onboarding/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const OPTIONS_LA: Record<'text' | 'value', string>[] =
  ACCEPTABLE_EMAIL_DOMAINS.map((domain) => ({ text: domain, value: domain }));

const BACK_LINK = '/lookup-email';

const SignupLAForm: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<OnboardingResult<SignupLAFormData>>();
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState(undefined);

    const formData = new FormData(event.currentTarget);
    const result = await submitOnboarding<SignupLAFormData>(
      '/api/onboarding/signup-la',
      {
        regfullname: formData.get('regfullname'),
        regla: formData.get('regla'),
        regorgname: formData.get('regorgname'),
        regrole: formData.get('regrole'),
        regmail: formData.get('regmail'),
      }
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
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="regfullname">
          Full name
        </label>

        <input
          className="govuk-input govuk-!-width-one-half"
          id="regfullname"
          name="regfullname"
          type="text"
          spellCheck="false"
          autoComplete="regfullname"
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="regla">
          Local Authority
        </label>
        <div id="regla-hint" className="govuk-hint">
          If your Local Authority is not listed, select Other and enter the name
          of your organisation
        </div>
        <select
          className="govuk-select govuk-!-width-one-half"
          id="regla"
          name="regla"
          aria-describedby="regla-hint"
          defaultValue=""
        >
          <option value="">Select your Local Authority from the list</option>

          {OPTIONS_LA.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="regorgname">
          Name of your organisation (optional)
        </label>

        <input
          className="govuk-input govuk-!-width-one-half"
          id="regorgname"
          name="regorgname"
          type="text"
          spellCheck="false"
          autoComplete="regorgname"
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="regrole">
          Your role in the organisation
        </label>

        <input
          className="govuk-input govuk-!-width-one-half"
          id="regrole"
          name="regrole"
          type="text"
          spellCheck="false"
          autoComplete="regrole"
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="regmail">
          Local Authority email address
        </label>

        <input
          className="govuk-input govuk-!-width-one-half"
          id="regmail"
          name="regmail"
          type="email"
          spellCheck="false"
          autoComplete="regmail"
        />
      </div>

      {/* ------------------------------------- */}
      <div className="govuk-button-group govuk-!-margin-top-6">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          disabled={isPending}
        >
          Request access to GASCD
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

export default SignupLAForm;
