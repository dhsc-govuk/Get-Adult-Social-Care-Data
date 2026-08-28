import { redactUserInfo } from '../../scripts/obfuscate';
import { authDB } from './auth';
import {
  isAcceptableEmail,
  isNonEmptyString,
  LA_EMAIL_DOMAIN_ID_MAP,
} from './domain-check';
import { generateId } from 'better-auth';
import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

type ValidLocationType = 'Care provider' | 'Care provider location' | 'LA';

type DBRecordNewUser = {
  id: string;
  analyticsId: string;
  name: string; // The email is used here for this value.
  registeredName: string;
  email: string;
  registeredEmail: string;
  emailVerified: 1; // Default value is 1 (Context unknown.)
  locationId: string;
  selectedLocationId: string; // Can have the same value as 'locationId' when locationType is 'LA'
  locationType: ValidLocationType;
  source: 'manual'; // Acceptable values: 'manual'... Can be expanded (to 'string') later
  role: 'member'; // Default value is set to 'member' (Context unknown)
};

const USER_DATABASE_NAME = 'user';

type Verdict = 'EXISTS' | 'CREATED';
type Result = { result: Verdict };
export async function createNewDBUser(email: unknown): Promise<Result> {
  if (isNonEmptyString(email) === false) {
    throw new Error(`A valid email cannot be empty`);
  }

  const parsedResult = parseEmail(email);
  if (parsedResult == null) {
    throw new Error(`The email did not pass our validation check`);
  }

  const { location_id } = parsedResult;

  const email_lower = email.toLowerCase();
  const user_match = await authDB
    .selectFrom(USER_DATABASE_NAME)
    .select('id')
    .where('email', '=', email_lower)
    .executeTakeFirst();

  if (user_match) {
    return { result: 'EXISTS' };
  }

  const user_id = generateId();
  const newDataRow: DBRecordNewUser = {
    locationId: location_id,
    locationType: 'LA',
    name: email_lower,
    registeredName: email_lower,
    email: email_lower,
    registeredEmail: email_lower,
    source: 'manual',
    analyticsId: generateAnalyticsId(),
    id: user_id,
    emailVerified: 1,
    role: 'member',
    selectedLocationId: location_id,
  };

  try {
    await authDB.insertInto(USER_DATABASE_NAME).values(newDataRow).execute();

    console.log('New user created successfully.', { user_id });
    return { result: 'CREATED' };
  } catch (error) {
    throw new Error('An error occurred trying to create the new user');
  } finally {
    authDB.destroy();
  }
}

type ParsedEmailResult = { domain: string; location_id: string };
function parseEmail(email: string): ParsedEmailResult | null {
  if (isAcceptableEmail(email)) {
    const domain = email.split('@')[1];
    const location_id = LA_EMAIL_DOMAIN_ID_MAP[domain];
    if (isNonEmptyString(location_id)) {
      return { domain, location_id };
    }
  }

  return null;
}
