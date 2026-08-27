import { getLocationIdForEmail } from './domain-check';
import { LA_USER_TYPE } from '@/constants';

// Mirrors the row gascd-admin writes when an admin adds an LA user by hand
// (UserController.AddLaUser), so self-signed-up and manually added LA users are
// indistinguishable downstream. `source` is the only thing that differs.
export const LA_SELF_SIGNUP_SOURCE = 'la-self-signup';

const ID_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ANALYTICS_ID_LENGTH = 32;

// better-auth style analytics id: 'ua-' followed by 32 alphanumeric characters,
// matching BetterAuthIdGenerator.GenerateAnalyticsId in gascd-admin.
export function generateAnalyticsId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ANALYTICS_ID_LENGTH));
  let id = '';
  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return `ua-${id}`;
}

export type LaUserFields = {
  registeredEmail: string;
  registeredName: string;
  locationType: string;
  locationId: string;
  selectedLocationId: string;
  source: string;
  analyticsId: string;
  role: string;
};

// The fields needed to onboard an allow-listed LA user, or null when the address
// is not on the allow-list. selectedLocationId is set alongside locationId so
// the new user lands straight in the LA view instead of /location-select.
export function buildLaUserFields(
  email: unknown,
  name: unknown
): LaUserFields | null {
  const locationId = getLocationIdForEmail(email);
  if (typeof email !== 'string' || !locationId) {
    return null;
  }

  const normalisedEmail = email.trim().toLowerCase();
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  return {
    // registeredEmail is compared against the IdP-supplied email on every
    // request by isUserRegistered, so both sides are stored lowercased.
    registeredEmail: normalisedEmail,
    registeredName: trimmedName || normalisedEmail,
    locationType: LA_USER_TYPE,
    locationId,
    selectedLocationId: locationId,
    source: LA_SELF_SIGNUP_SOURCE,
    analyticsId: generateAnalyticsId(),
    role: 'member',
  };
}
