import logger from '@/utils/logger';
import { isAcceptableEmail } from '@/lib/domain-check';
import { auth } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import type {
  LookupEmailFormData,
  OnboardingResult,
  SignupLAFormData,
  WhoamiFormData,
} from './types';

// Placeholder link, for demo purposes - INTERIM TEMP SOLUTION
const CONFIRM_LA_PATH = '/confirm-la?sref=HDJ2123F';

export async function handleSignupLA(
  body: unknown
): Promise<OnboardingResult<SignupLAFormData>> {
  const rawFormData: SignupLAFormData = {
    regfullname: readField(body, 'regfullname'),
    regla: readField(body, 'regla'),
    regmail: readField(body, 'regmail'),
    regorgname: readField(body, 'regorgname'), // Optional
    regrole: readField(body, 'regrole'),
  };

  // ...

  return { type: 'navigate', path: CONFIRM_LA_PATH };
}

export async function handleEmailDomainCheck(
  body: unknown
): Promise<OnboardingResult<LookupEmailFormData>> {
  const rawFormData: LookupEmailFormData = {
    regmail: readField(body, 'regmail'),
    // ...
  };

  if (isAcceptableEmail(rawFormData.regmail)) {
    // Confirmation page
    return { type: 'navigate', path: CONFIRM_LA_PATH };
  }
  // Page for User Signup
  return { type: 'navigate', path: '/signup-la' };
}

export async function handleWhoami(
  body: unknown,
  requestHeaders: Headers
): Promise<OnboardingResult<WhoamiFormData>> {
  const rawFormData: WhoamiFormData = {
    id: readField(body, 'id'),
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
      return { type: 'navigate', path: '/access-denied' };
    }

    case 'u:la': {
      return { type: 'navigate', path: '/lookup-email' };
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
            headers: requestHeaders,
          });

          logger.info('Local auth session started');
        } else {
          responseAuth = await auth.api.signInWithOAuth2({
            body: {
              providerId: 'govuk-one-login',
              callbackURL: withBasePath('/home'),
            },
            headers: requestHeaders,
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

      return { type: 'external', url: responseAuth.url! };
    }
    default: {
      return {
        type: 'error',
        description: 'Invalid option received',
        values: rawFormData,
      };
    }
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

function readField(body: unknown, key: string): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const value = (body as Record<string, unknown>)[key];
  return isNonEmptyString(value) ? value : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
