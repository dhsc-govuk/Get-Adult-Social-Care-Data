import { authDB } from './auth';
import { ParsedEmailResult } from './domain-check';
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
  emailVerified: 0 | 1; // Context unknown.
  locationId: string;
  selectedLocationId: string; // Can have the same value as 'locationId' when locationType is 'LA'
  locationType: ValidLocationType;
  source: 'manual'; // Acceptable values: 'manual'... Can be expanded (to 'string') later
  role: 'member'; // Default value is set to 'member' (Context unknown)
};

const USER_DATABASE_NAME = 'user';

type Verdict = 'EXISTS' | 'CREATED';
type Result = { dbustatus: Verdict; dbuid: string };
export async function createNewDBUser(
  parsedEmail: ParsedEmailResult | null
): Promise<Result> {
  if (parsedEmail == null) {
    throw new Error(`The email did not pass our validation check`);
  }

  const { location_id, email } = parsedEmail;

  const email_lower = email.toLowerCase();
  const user_match = await authDB
    .selectFrom(USER_DATABASE_NAME)
    .select('id')
    .where('email', '=', email_lower)
    .executeTakeFirst();

  if (user_match) {
    return { dbustatus: 'EXISTS', dbuid: user_match.id };
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
    emailVerified: 0,
    role: 'member',
    selectedLocationId: location_id,
  };

  try {
    await authDB.insertInto(USER_DATABASE_NAME).values(newDataRow).execute();

    console.log('New user created successfully.', { user_id });
    return { dbustatus: 'CREATED', dbuid: user_id };
  } catch (error) {
    throw new Error('An error occurred trying to create the new user');
  }
}
