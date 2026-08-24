'use client';
import React, { useActionState } from 'react';
import Link from 'next/link';
import { handleFormWhoami } from '@/server-actions';

const BACK_LINK = '/login';

const WhoamiForm: React.FC = () => {
  const [state, action, isPending] = useActionState(
    handleFormWhoami,
    undefined
  );

  return (
    <form action={action}>
      <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 className="govuk-fieldset__heading">
            What type of user are you?
          </h1>
        </legend>
        <div id="signIn-hint" className="govuk-hint">
          Select the option that best describes you. You can only use this
          service if you are the nominated individual or registered manager for
          a CQC registered care provider organisation or are a local authority
          officer
        </div>
        <div className="govuk-radios" data-module="govuk-radios">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="user-la"
              type="radio"
              name="id"
              value="u:la"
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="user-la"
            >
              Local Authority Officer
            </label>
          </div>
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="user-cqc"
              type="radio"
              name="id"
              value="u:cqc"
              aria-describedby="user-cqc-item-hint"
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="user-cqc"
            >
              CQC-registered care provider
            </label>
            <div
              id="user-cqc-item-hint"
              className="govuk-hint govuk-radios__hint"
            >
              This encompasses being either a Nominated individual (NI) or a
              Registered Manager (RM)
            </div>
          </div>

          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="user-x"
              type="radio"
              name="id"
              value="u:x"
            />
            <label className="govuk-label govuk-radios__label" htmlFor="user-x">
              Neither of these
            </label>
          </div>
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
          {isPending ? 'Processing...' : 'Continue'}
        </button>

        {state?.description && (
          <p className="govuk-error-message">{state.description}</p>
        )}

        <Link href={BACK_LINK} className="govuk-link">
          Cancel and go back
        </Link>
      </div>
    </form>
  );
};

export default WhoamiForm;
