import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { handleFormLookupLA } from '@/server-actions';
import Form from 'next/form';
import { ActionResponse, LookupLAFormData } from '@/server-actions/types';
import { isAcceptableEmail, isNonEmptyString } from '@/lib/domain-check';
import { createNewDBUser } from '@/lib/create-new-user';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const BACK_LINK = '/whoami';

const LookupLAForm: React.FC = () => {
  const router = useRouter();

  const [state, action, isPending] = useActionState(handleFormSubmit, {
    fields: {},
    next: null,
  });

  useEffect(() => {
    console.log(':$:-- LookupLA --', { state });

    if (state.error == null && state.next) {
      router.push(state.next);
    }
  }, [state]);

  return (
    <Form action={action}>
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
            defaultValue={state.error == null ? state.fields.regmail : ''}
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
    regmail: isNonEmptyString(regmail) ? regmail : '',
    // ...
  };

  let nextPageURL: string | null = null;
  if (isAcceptableEmail(rawFormData.regmail)) {
    // Insert into database
    // ...
    const verdict = await createNewDBUser(rawFormData.regmail);

    if (verdict.result == 'EXISTS') {
      // Proceed to the OneLogin flow
      const responseAuth = await authClient.signIn.oauth2({
        providerId: 'govuk-one-login',
        callbackURL: '/home',
      });
      // const responseAuth = await auth.api.signInWithOAuth2({
      //   body: {
      //     providerId: 'govuk-one-login',
      //     callbackURL: '/home',
      //   },
      //   headers: await headers(),
      // });
      nextPageURL = responseAuth.data?.url ?? null;
    } else {
      // Redirect to Confirmation page
      nextPageURL = CONFIRM_LA_LINK;
    }
  } else {
    // Redirect to page for User Signup
    nextPageURL = `/signup-la`;
  }

  return { fields: rawFormData, next: nextPageURL };
}
