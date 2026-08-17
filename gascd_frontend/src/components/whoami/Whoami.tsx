// import { withBasePath } from '@/lib/basePath';
// import React, { useActionState } from 'react';
import React from 'react';
import Link from 'next/link';
// import { authClient } from '@/lib/auth-client';

const Whoami: React.FC = () => {
  // const handleSubmit = async () => {
  //   const { data, error } = await authClient.signIn.oauth2({
  //     providerId: 'govuk-one-login',
  //     callbackURL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/home`,
  //   });
  //   if (error) {
  //     return {
  //       error:
  //         'Sorry, there is a problem with the service. Please try again later.',
  //     };
  //   }
  // };

  // const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-form-group">
          {/* <form action={formAction}> */}
          <form>
            <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h1 className="govuk-fieldset__heading">
                  What type of user are you?
                </h1>
              </legend>
              <div id="signIn-hint" className="govuk-hint">
                Select the option that best describes you. You can only use this
                service if you are the nominated individual or registered
                manager for a CQC registered care provider organisation or are a
                local authority officer
              </div>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="user-la"
                    name="user"
                    type="radio"
                    value="LA"
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="user-la"
                  >
                    Local authority officer
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="user-ni"
                    name="user"
                    type="radio"
                    value="government-gateway"
                    aria-describedby="user-ni-item-hint"
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="user-ni"
                  >
                    Nominated individual for a CQC-registered care provider
                  </label>
                  <div
                    id="user-ni-item-hint"
                    className="govuk-hint govuk-radios__hint"
                  >
                    Use the same email address for your GOV.UK One Login that
                    you for your CQC registration.
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="user-rm"
                    name="user"
                    type="radio"
                    value="govuk-one-login"
                    aria-describedby="user-rm-item-hint"
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="user-rm"
                  >
                    Registered manager for a CQC-registered care provider
                  </label>
                  <div
                    id="user-rm-item-hint"
                    className="govuk-hint govuk-radios__hint"
                  >
                    Use the same email address for your GOV.UK One Login that
                    you for your CQC registration.
                  </div>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="user-x"
                    name="user"
                    type="radio"
                    value="X"
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="user-x"
                  >
                    None of these
                  </label>
                </div>
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

export default Whoami;
