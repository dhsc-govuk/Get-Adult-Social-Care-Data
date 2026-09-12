'use server';
import { isNonEmptyString, validateFormFields } from '@/lib/domain-check';
import { redirect } from 'next/navigation';
import type { ActionResponse, SignupLAFormData, WhoamiFormData } from './types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
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
    regfullname: isNonEmptyString(regfullname) ? regfullname : '',
    regla: isNonEmptyString(regla) ? regla : '',
    regmail: isNonEmptyString(regmail) ? regmail : '',
    regorgname: isNonEmptyString(regorgname) ? regorgname : '', // Optional
    regrole: isNonEmptyString(regrole) ? regrole : '',
  };

  // ...

  redirect(CONFIRM_LA_LINK);
}

export async function handleFormWhoami(
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
      nextPageURL = '/access-denied';
    }

    case 'u:la': {
      nextPageURL = `/lookup-email`;
    }

    case 'u:cqc': {
      // router.push('/home');
      // window.history.pushState({}, '', '/home');
      let responseAuth = null;
      try {
        if (process.env.NODE_ENV === 'development') {
          if (
            !process.env.LOCAL_AUTH_EMAIL ||
            !process.env.LOCAL_AUTH_PASSWORD
          ) {
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

      nextPageURL = responseAuth.url ?? null;
    }
  }

  return { fields: rawFormData, next: nextPageURL };
}
