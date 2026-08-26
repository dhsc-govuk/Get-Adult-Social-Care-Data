'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { handleFormEmailDomainCheck } from '@/server-actions';
import { withBasePath } from '@/lib/basePath';

const BACK_LINK = withBasePath('/whoami');

const LookupLAForm: React.FC = () => {
  const [state, action, isPending] = useActionState(
    handleFormEmailDomainCheck,
    undefined
  );

  return (
    <form action={action}>
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

        <Link href={BACK_LINK} className="govuk-link">
          Cancel and go back
        </Link>
      </div>
    </form>
  );
};

export default LookupLAForm;
