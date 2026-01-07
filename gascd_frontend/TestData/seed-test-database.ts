import 'dotenv/config';
import { auth } from '@/lib/auth';
import { msdialect } from '@/lib/authDatabase';
import { Kysely } from 'kysely';

const seedDevelopmentUser = async () => {
  const email = process.env.LOCAL_AUTH_EMAIL;
  const password = process.env.LOCAL_AUTH_PASSWORD;
  const name = 'Testing User';

  if (!password || !email) {
    console.error(
      '❌ Error: LOCAL_AUTH_EMAIL and/or LOCAL_AUTH_PASSWORD not set in environment.'
    );
    process.exit(1);
  }

  console.log(`Attempting to create seed user: ${email}...`);

  try {
    // We use the better auth API to set up the user and deal with the password properly
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: name,
      },
    });
    console.log('✅ Development user created successfully!');
  } catch (error: any) {
    if (error.message == 'Email and password sign up is not enabled') {
      console.log('-- Have you set LOCAL_AUTH=true in your environment?');
      return;
    } else if (error.message.includes('User already exists')) {
      // this is fine
    } else {
      console.error('❌ Unexpected error during seeding:', error.message);
      return;
    }
  }

  // Now update the user properties
  // This updates the db directly, because the location properties are
  // protected from being updated through the Better Auth client API
  const db = new Kysely<any>({ dialect: msdialect });
  const rows = await db
    .updateTable('user')
    .set({
      locationId: process.env.LOCAL_AUTH_LOCATION_ID,
      locationType: process.env.LOCAL_AUTH_LOCATION_TYPE,
      registeredEmail: email,
    })
    .where('user.email', '=', process.env.LOCAL_AUTH_EMAIL)
    .executeTakeFirst();

  console.log('✅ Development user updated successfully!');
};

seedDevelopmentUser();
