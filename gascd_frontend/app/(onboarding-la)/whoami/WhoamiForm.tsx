import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import Form from 'next/form';
import { isNonEmptyString, validateFormFields } from '@/lib/domain-check';
import { ActionResponse, WhoamiFormData } from '@/server-actions/types';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { withBasePath } from '@/lib/basePath';

const BACK_LINK = '/login';

const WhoamiForm: React.FC = () => {
  const router = useRouter();

  const [state, action, isPending] = useActionState(handleFormSubmit, {
    fields: {},
    next: null,
  });

  useEffect(() => {
    if (state.error == null && state.next) {
      router.replace(state.next);
      router.refresh();
    }
  }, [state]);

  return (
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
              defaultChecked={state.error == null && state.fields.id === 'u:la'}
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
              defaultChecked={
                state.error == null && state.fields.id === 'u:cqc'
              }
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
              defaultChecked={state.error == null && state.fields.id === 'u:x'}
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
    id: isNonEmptyString(_id) ? _id : '',
  };

  const errors = validateFormFields(rawFormData);
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    return {
      error: 'Invalid option received',
      errors,
    };
  }

  let nextPageURL: string | null = null;
  switch (rawFormData.id) {
    case 'u:x': {
      nextPageURL = '/access-denied?reason=ineligible';
      break;
    }

    case 'u:la': {
      nextPageURL = `/lookup-email`;
      break;
    }

    case 'u:cqc': {
      // Start One Login. The auth client redirects the browser to the provider
      // itself, so no in-app navigation is set on this path. For local
      // development sign-in use the /api/auth/local route (see README).
      const { error } = await authClient.signIn.oauth2({
        providerId: 'govuk-one-login',
        callbackURL: withBasePath('/home'),
      });
      if (error) {
        return {
          error:
            'Sorry, there is a problem with the service. Please try again later.',
          fields: rawFormData,
        };
      }
      break;
    }
  }

  return { fields: rawFormData, next: nextPageURL };
}
