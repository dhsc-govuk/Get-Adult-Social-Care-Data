'use server';
import logger from '@/utils/logger';
import { isAcceptableEmail } from '@/lib/domain-check';
import { redirect } from 'next/navigation';
import type { ActionResponse, SignupLAData, WhoamiFormData } from './types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function handleFormSignupLA(
  prev: ActionResponse<SignupLAData> | null,
  formData: FormData
): Promise<ActionResponse<SignupLAData> | undefined> {
  const regfullname = formData.get('regfullname');
  const regla = formData.get('regla');
  const regmail = formData.get('regmail');
  const regorgname = formData.get('regorgname');
  const regrole = formData.get('regrole');

  const rawFormData: SignupLAData = {
    regfullname: isNonEmptyString(regfullname) ? regfullname : null,
    regla: isNonEmptyString(regla) ? regla : null,
    regmail: isNonEmptyString(regmail) ? regmail : null,
    regorgname: isNonEmptyString(regorgname) ? regorgname : null, // Optional
    regrole: isNonEmptyString(regrole) ? regrole : null,
  };

  // ...
  return;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
export async function checkEmailDomain(formData: FormData) {
  const rawFormData = {
    email: formData.get('email'),
    // ...
  };

  if (isAcceptableEmail(rawFormData.email)) {
    // Redirect to Confirmation page
    redirect('/confirm-la?sref=HDJ2123F');
  } else {
    // Redirect to page for User Signup
    redirect(`/signup-la`);
  }
}

export async function processWhoami(
  previousState: ActionResponse<WhoamiFormData> | null,
  formData: FormData
): Promise<ActionResponse<WhoamiFormData> | undefined> {
  const _id = formData.get('id');
  const rawFormData: WhoamiFormData = {
    id: isNonEmptyString(_id) ? _id : null,
  };

  const errors = validateFormFields(rawFormData);
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    return {
      success: false,
      description: 'Invalid option received',
      values: rawFormData,
      errors,
    };
  }
  console.log('========%%%%%%%', rawFormData, { previousState });

  switch (rawFormData.id) {
    case 'u:x': {
      redirect('/access-denied');
    }

    case 'u:la': {
      redirect(`/lookup-email`);
    }

    case 'u:cqc': {
      let responseAuth = null;
      try {
        if (process.env.NODE_ENV === 'development') {
          if (
            !process.env.LOCAL_AUTH_EMAIL ||
            !process.env.LOCAL_AUTH_PASSWORD
          ) {
            throw Error(
              'LOCAL_AUTH_EMAIL or LOCAL_AUTH_PASSWORD not found in env'
            );
          }

          responseAuth = await auth.api.signInEmail({
            body: {
              email: process.env.LOCAL_AUTH_EMAIL,
              password: process.env.LOCAL_AUTH_PASSWORD,
              callbackURL: '/home',
            },
            headers: await headers(),
          });

          logger.info('Local auth session started');
        } else {
          responseAuth = await auth.api.signInWithOAuth2({
            body: {
              providerId: 'govuk-one-login',
              callbackURL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/home`,
            },
            headers: await headers(),
          });
        }
      } catch (error) {
        const ERROR_MSG =
          'Sorry, there is a problem with the service. Please try again later.';
        logger.error(ERROR_MSG, { error });

        return {
          success: false,
          description: ERROR_MSG,
          errors: {},
          values: {},
        };
      }

      console.log('[response-auth]:', responseAuth);
      redirect(responseAuth.url!);
    }
    default:
    ///
  }

  // return {
  //   success: true,
  //   message: 'All form values passed the validation check.',
  // };
}

type WhoamiErrors = Partial<WhoamiFormData>;
function validateFormFields(fields: WhoamiFormData): WhoamiErrors {
  const errors: WhoamiErrors = {};

  const EXPECTED_ID_VALUES = ['u:la', 'u:cqc', 'u:x'];
  if (fields.id == null || EXPECTED_ID_VALUES.includes(fields.id) === false) {
    errors.id = 'Select an option';
  }

  return errors;
}
