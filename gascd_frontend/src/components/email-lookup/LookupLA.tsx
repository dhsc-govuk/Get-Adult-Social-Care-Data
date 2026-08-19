// import { withBasePath } from '@/lib/basePath';
// import React, { useActionState } from 'react';
import React from 'react';
import Link from 'next/link';
// import { authClient } from '@/lib/auth-client';

const LookupLA: React.FC = () => {
  const showDomainNoMatchWarning = true;
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-form-group">
          {/* <form action={formAction}> */}
          <form>
            <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h1 className="govuk-fieldset__heading">
                  Check your email here
                </h1>
              </legend>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="la-user-email">
                  Email
                </label>
                {/* <div id="la-user-email-hint" className="govuk-hint">
                  A domain match must be found before Location ID can be
                  selected.
                </div> */}
                <input
                  id="la-user-email"
                  className="govuk-input govuk-!-width-one-third"
                  type="email"
                  aria-describedby="la-user-email-hint"
                  // value={email}
                  // onChange={(event) => setEmail(event.target.value)}
                  // disabled={submitting}
                />
                {showDomainNoMatchWarning ? (
                  <p className="govuk-warning-text govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                    <span
                      className="govuk-warning-text__icon"
                      aria-hidden="true"
                    >
                      !
                    </span>
                    <strong className="govuk-warning-text__text">
                      <span className="govuk-visually-hidden">Warning</span>
                      No matching council domain was found for this email
                      address.
                    </strong>
                  </p>
                ) : null}
              </div>
            </fieldset>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
              >
                Continue
              </button>
              {/* <button
                type="submit"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Continue'}
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
              {state && <p className="govuk-error-message">{state.error}</p>} */}

              <Link href="#" className="govuk-link">
                Cancel and go back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LookupLA;
