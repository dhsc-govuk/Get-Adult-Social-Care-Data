import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import Form from 'next/form';
import { isNonEmptyString, validateFormFields } from '@/lib/domain-check';
import { ActionResponse, WhoamiFormData } from '@/server-actions/types';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useFormStatus } from 'react-dom';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { handleFormWhoami } from '@/server-actions';

const BACK_LINK = '/login';

const WhoamiForm: React.FC = () => {
  const router = useRouter();

  // const { data, action, pending: isPending } = useFormStatus();
  const [state, action, isPending] = useActionState(handleFormSubmit, {
    fields: {},
  });

  useEffect(() => {
    console.log(':$:', { state });
    if (state.error == null) {
      switch (state.fields.id) {
        case 'u:x': {
          router.push('/access-denied');
          return;
        }

        case 'u:la': {
          router.push(`/lookup-email`);
          return;
        }

        case 'u:cqc': {
          // router.push('/home');
          // window.history.pushState({}, '', '/home');
        }
      }
    }
  }, [state]);

  return (
    // <Form action={handleFormSubmit}>
    <Form action={action}>
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

        {state?.error && <p className="govuk-error-message">{state.error}</p>}

        <Link href={BACK_LINK} className="govuk-link">
          Cancel and go back
        </Link>
      </div>
    </Form>
  );
};

export default WhoamiForm;

async function handleFormSubmit(
  _prev: ActionResponse<WhoamiFormData>,
  formData: FormData
): Promise<ActionResponse<WhoamiFormData>> {
  // ) {
  const _id = formData.get('id');
  const rawFormData: WhoamiFormData = {
    id: isNonEmptyString(_id) ? _id : null,
  };

  const errors = validateFormFields(rawFormData);
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    return {
      error: 'Invalid option received',
      errors,
    };
  }

  if (rawFormData.id === 'u:cqc') {
    let responseAuth = null;
    try {
      if (process.env.NODE_ENV === 'development') {
        if (!process.env.LOCAL_AUTH_EMAIL || !process.env.LOCAL_AUTH_PASSWORD) {
          throw new Error(
            'LOCAL_AUTH_EMAIL or LOCAL_AUTH_PASSWORD not found in env'
          );
        }

        responseAuth = await authClient.signIn.email({
          email: process.env.LOCAL_AUTH_EMAIL,
          password: process.env.LOCAL_AUTH_PASSWORD,
          callbackURL: '/home',
        });
        // responseAuth = await auth.api.signInEmail({
        //   body: {
        //     email: process.env.LOCAL_AUTH_EMAIL,
        //     password: process.env.LOCAL_AUTH_PASSWORD,
        //     callbackURL: '/home',
        //   },
        //   headers: await headers(),
        // });

        console.info('Local auth session started');
      } else {
        responseAuth = await authClient.signIn.oauth2({
          providerId: 'govuk-one-login',
          callbackURL: '/home',
        });
        // responseAuth = await auth.api.signInWithOAuth2({
        //   body: {
        //     providerId: 'govuk-one-login',
        //     callbackURL: '/home',
        //   },
        //   headers: await headers(),
        // });
      }
    } catch (error) {
      const ERROR_MSG =
        'Sorry, there is a problem with the service. Please try again later.';
      console.error(ERROR_MSG, { error });

      // throw new Error(ERROR_MSG);
      return {
        error: ERROR_MSG,
      };
    }
    console.log('[response-auth]:', responseAuth);
  }

  return { fields: rawFormData };
}
