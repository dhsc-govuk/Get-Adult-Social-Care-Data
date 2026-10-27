import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import Form from 'next/form';
import { ActionResponse, LookupLAFormData } from '@/server-actions/types';
import { isNonEmptyString, validateLaLookupEmail } from '@/lib/domain-check';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { withBasePath } from '@/lib/basePath';
import { checkLaEmailDomain } from './actions';

const BACK_LINK = '/whoami';
const INPUT_ID = 'la-user-email';

const LookupLAForm: React.FC = () => {
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

  const fieldError = state.error != null ? state.errors?.regmail : undefined;
  const serviceError =
    state.error != null && !fieldError ? state.error : undefined;
  const describedBy = [`${INPUT_ID}-hint`, fieldError && `${INPUT_ID}-error`]
    .filter(Boolean)
    .join(' ');

  return (
    <Form action={action} noValidate>
      {fieldError && (
        <div
          className="govuk-error-summary"
          data-module="govuk-error-summary"
          role="alert"
        >
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              <li>
                <a href={`#${INPUT_ID}`}>{fieldError}</a>
              </li>
            </ul>
          </div>
        </div>
      )}

      <fieldset className="govuk-fieldset" aria-describedby="signIn-hint">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 className="govuk-fieldset__heading">
            Enter your Local Authority email address
          </h1>
        </legend>

        <div
          className={`govuk-form-group ${fieldError ? 'govuk-form-group--error' : ''}`}
        >
          <label className="govuk-label" htmlFor={INPUT_ID}>
            Email address
          </label>
          <p
            id={`${INPUT_ID}-hint`}
            className="govuk-hint govuk-!-margin-top-0"
          >
            Use the work email address issued by your Local Authority. We check
            that it belongs to a Local Authority before you sign in with GOV.UK
            One Login.
          </p>
          {fieldError && (
            <p id={`${INPUT_ID}-error`} className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {fieldError}
            </p>
          )}
          <input
            className={`govuk-input govuk-!-width-one-third ${fieldError ? 'govuk-input--error' : ''}`}
            id={INPUT_ID}
            name="regmail"
            type="email"
            spellCheck="false"
            autoComplete="email"
            aria-describedby={describedBy}
            defaultValue={state.fields?.regmail ?? ''}
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

        {serviceError && (
          <p className="govuk-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span> {serviceError}
          </p>
        )}

        <Link href={BACK_LINK} className="govuk-link">
          Cancel and go back
        </Link>
      </div>
    </Form>
  );
};

export default LookupLAForm;

const CONFIRM_LA_LINK = '/confirm-la';
async function handleFormSubmit(
  _prev: ActionResponse<LookupLAFormData>,
  formData: FormData
): Promise<ActionResponse<LookupLAFormData>> {
  const regmail = formData.get('regmail');

  const rawFormData: LookupLAFormData = {
    regmail: isNonEmptyString(regmail) ? regmail.trim() : '',
  };

  const validationError = validateLaLookupEmail(rawFormData.regmail);
  if (validationError) {
    return {
      error: validationError,
      errors: { regmail: validationError },
      fields: rawFormData,
    };
  }

  const looksEligible = await checkLaEmailDomain(rawFormData.regmail);
  if (!looksEligible) {
    // Domain is not on the LA allowlist: send to the "could not verify" page
    return { fields: rawFormData, next: '/signup-la' };
  }

  // Proceed to One Login with sign-up requested. The auth client redirects
  // the browser to the provider itself, so no in-app navigation is set on
  // this path. Eligibility is enforced server-side when One Login returns
  // the verified email (src/lib/la-signup.ts).
  const { error } = await authClient.signIn.oauth2({
    providerId: 'govuk-one-login',
    callbackURL: withBasePath('/home'),
    errorCallbackURL: withBasePath('/signup-la'),
    requestSignUp: true,
  });
  if (error) {
    return {
      error:
        'Sorry, there is a problem with the service. Please try again later.',
      fields: rawFormData,
    };
  }

  return { fields: rawFormData, next: null };
}
