'use server';
import {
  isAcceptableEmail,
  isNonEmptyString,
  validateFormFields,
} from '@/lib/domain-check';
import { redirect } from 'next/navigation';
import type {
  ActionResponse,
  LookupLAFormData,
  SignupLAFormData,
  WhoamiFormData,
} from './types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createNewDBUser } from '@/lib/create-new-user';

// Placeholder link, for demo purposes - INTERIM TEMP SOLUTION
const CONFIRM_LA_LINK = '/confirm-la';

export async function handleFormSignupLA(
  _prev: ActionResponse<SignupLAFormData>,
  formData: FormData
): Promise<ActionResponse<SignupLAFormData>> {
  const regfullname = formData.get('regfullname');
  const regla = formData.get('regla');
  const regmail = formData.get('regmail');
  const regorgname = formData.get('regorgname');
  const regrole = formData.get('regrole');

  // ...Object.fromEntries(formData)
  const rawFormData: SignupLAFormData = {
    regfullname: isNonEmptyString(regfullname) ? regfullname : null,
    regla: isNonEmptyString(regla) ? regla : null,
    regmail: isNonEmptyString(regmail) ? regmail : null,
    regorgname: isNonEmptyString(regorgname) ? regorgname : null, // Optional
    regrole: isNonEmptyString(regrole) ? regrole : null,
  };

  // ...

  redirect(CONFIRM_LA_LINK);
}

export async function handleFormLookupLA(
  _prev: ActionResponse<LookupLAFormData>,
  formData: FormData
): Promise<ActionResponse<LookupLAFormData>> {
  const regmail = formData.get('regmail');

  const rawFormData: LookupLAFormData = {
    regmail: isNonEmptyString(regmail) ? regmail : null,
    // ...
  };

  if (isAcceptableEmail(rawFormData.regmail)) {
    // Insert into database
    // ...
    const verdict = await createNewDBUser(rawFormData.regmail);

    if (verdict.result == 'EXISTS') {
      // Proceed to the OneLogin flow
      const responseAuth = await auth.api.signInWithOAuth2({
        body: {
          providerId: 'govuk-one-login',
          callbackURL: '/home',
        },
        headers: await headers(),
      });

      redirect(responseAuth.url!);
    } else {
      // Redirect to Confirmation page
      redirect(CONFIRM_LA_LINK);
    }
  } else {
    // Redirect to page for User Signup
    redirect(`/signup-la`);
  }
}

export async function handleFormWhoami(
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

        // responseAuth = await authClient.signIn.email({
        //   email: process.env.LOCAL_AUTH_EMAIL,
        //   password: process.env.LOCAL_AUTH_PASSWORD,
        //   callbackURL: '/home',
        // });
        responseAuth = await auth.api.signInEmail({
          body: {
            email: process.env.LOCAL_AUTH_EMAIL,
            password: process.env.LOCAL_AUTH_PASSWORD,
            callbackURL: '/home',
          },
          headers: await headers(),
        });

        console.info('Local auth session started');
      } else {
        // responseAuth = await authClient.signIn.oauth2({
        //   providerId: 'govuk-one-login',
        //   callbackURL: '/home',
        // });
        responseAuth = await auth.api.signInWithOAuth2({
          body: {
            providerId: 'govuk-one-login',
            callbackURL: '/home',
          },
          headers: await headers(),
        });
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
