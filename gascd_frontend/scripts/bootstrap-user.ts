// dotenv/config to load env vars in development
import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';

const bootstrapUser = async (
  email: string,
  location_id: string,
  location_type: string
) => {
  console.log(
    `Attempting to create user: ${email} / ${location_id} / ${location_type}`
  );

  // This updates the db directly, because the location properties are
  // protected from being updated through the Better Auth client API
  const userid = generateId();
  await authDB
    .insertInto('user')
    .values({
      id: userid,
      name: email,
      email: email,
      registeredEmail: email,
      emailVerified: 1,
      locationId: location_id,
      locationType: location_type,
      role: 'member',
    })
    .execute();

  console.log('✅ User created: ' + userid);
};

const args = process.argv.slice(2);
const email = args[0];
const location_id = args[1];
const location_type = args[2];

if (!(email && location_id && location_type)) {
  console.error('Please provide an email, location ID and location type');
  process.exit(1);
}

await bootstrapUser(email, location_id, location_type);
authDB.destroy();
