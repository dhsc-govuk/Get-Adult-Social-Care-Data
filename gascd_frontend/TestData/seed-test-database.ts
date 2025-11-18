import 'dotenv/config';
import { auth } from '@/lib/auth';

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
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: name,
      },
    });

    console.log(result);
    console.log('✅ Development user created successfully!');
  } catch (error: any) {
    console.error('❌ Error during seeding:', error.message);
    if (error.message == 'Email and password sign up is not enabled') {
      console.log('-- Have you set LOCAL_AUTH=true in your environment?');
    }
  }
};

seedDevelopmentUser();
