'use server';
import logger from '@/utils/logger';
import { isAcceptableEmail, isNonEmptyString } from '@/lib/domain-check';
import { redirect } from 'next/navigation';
import type { ActionResponse, SignupLAFormData, WhoamiFormData } from './types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { withBasePath } from '@/lib/basePath';
import { createNewDBUser } from '@/lib/create-new-user';

// Placeholder link, for demo purposes - INTERIM TEMP SOLUTION
const CONFIRM_LA_LINK = withBasePath('/confirm-la?sref=HDJ2123F');

export async function handleFormSignupLA(
  _prev: ActionResponse<SignupLAFormData> | undefined,
  formData: FormData
): Promise<ActionResponse<SignupLAFormData> | undefined> {
  const regfullname = formData.get('regfullname');
  const regla = formData.get('regla');
  const regmail = formData.get('regmail');
  const regorgname = formData.get('regorgname');
  const regrole = formData.get('regrole');

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

export async function handleFormEmailDomainCheck(
  _prev: unknown,
  formData: FormData
) {
  const regmail = formData.get('regmail');

  const rawFormData = {
    regmail: isNonEmptyString(regmail) ? regmail : null,
    // ...
  };

  if (isAcceptableEmail(rawFormData.regmail)) {
    // Insert into database
    // ...
    await createNewDBUser(rawFormData.regmail);

    // Redirect to Confirmation page
    redirect(CONFIRM_LA_LINK);
  } else {
    // Redirect to page for User Signup
    redirect(withBasePath(`/signup-la`));
  }
}

export async function handleFormWhoami(
  _prev: ActionResponse<WhoamiFormData> | undefined,
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
      type: 'error',
      description: 'Invalid option received',
      values: rawFormData,
      errors,
    };
  }

  switch (rawFormData.id) {
    case 'u:x': {
      redirect(withBasePath('/access-denied'));
    }

    case 'u:la': {
      redirect(withBasePath(`/lookup-email`));
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
              callbackURL: withBasePath('/home'),
            },
            headers: await headers(),
          });

          logger.info('Local auth session started');
        } else {
          responseAuth = await auth.api.signInWithOAuth2({
            body: {
              providerId: 'govuk-one-login',
              callbackURL: withBasePath('/home'),
            },
            headers: await headers(),
          });
        }
      } catch (error) {
        const ERROR_MSG =
          'Sorry, there is a problem with the service. Please try again later.';
        logger.error(ERROR_MSG, { error });

        return {
          type: 'error',
          description: ERROR_MSG,
        };
      }

      console.log('[response-auth]:', responseAuth);
      redirect(responseAuth.url!);
    }
    default:
    // ...
  }
}

// ================================
//  UTILITY FUNCTIONS
// ================================
type WhoamiErrors = Partial<WhoamiFormData>;
function validateFormFields(fields: WhoamiFormData): WhoamiErrors {
  const errors: WhoamiErrors = {};

  const EXPECTED_ID_VALUES = ['u:la', 'u:cqc', 'u:x'];
  if (fields.id == null || EXPECTED_ID_VALUES.includes(fields.id) === false) {
    errors.id = 'Select an option';
  }

  return errors;
}
