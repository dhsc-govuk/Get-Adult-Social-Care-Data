'use client';
import React, { useActionState } from 'react';
import Link from 'next/link';
import Form from 'next/form';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const Whoami: React.FC = () => {
  const handleSubmit = async (formdata: unknown) => {
    // const { data, error } = await authClient.signIn.oauth2({
    //   providerId: 'govuk-one-login',
    //   callbackURL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/home`,
    // });
    console.log('========%%%%%%%', formdata);
    // useFormStatus
    // useActionState

    const error = false;
    if (error) {
      return {
        error:
          'Sorry, there is a problem with the service. Please try again later.',
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, null);
  console.log('@@@@@@==========', state);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-form-group">
          <form action={formAction}>
            {/* <Form
            action={async function handler(formdata: FormData) {
              'use server';
              console.log('whoami...', formdata);
              const whoami = formdata.get('id');

              if (whoami == 'u:la') {
                redirect(`/lookup-email`);
              } else if (whoami == 'u:cqc') {
                if (process.env.NODE_ENV === 'development') {
                  const loggedin = await fetch('/api/auth/local');
                  redirect(loggedin.url);
                  // redirect('/api/auth/local');
                } else {
                  await authClient.signIn.oauth2({
                    providerId: 'govuk-one-login',
                    callbackURL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/home`,
                  });
                }
              }
              // Fallback / whoami === 'u:x'
              redirect('/access-denied');
            }}
          > */}
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
                    This encompasses being either a Nominated individual (NI) or
                    a Registered Manager (RM)
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
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="user-x"
                  >
                    Neither of these
                  </label>
                </div>
              </div>
            </fieldset>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Continue'}
              </button>

              {state && <p className="govuk-error-message">{state.error}</p>}

              <Link href="#" className="govuk-link">
                Cancel and go back
              </Link>
            </div>
            {/* </Form> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Whoami;
