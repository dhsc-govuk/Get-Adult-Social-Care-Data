import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';

const TESTING_SOURCE = '__testing__';

interface TestUser {
  email: string;
  locationId: string;
  locationType: string;
  selectedLocationId?: string;
}

const test_users: TestUser[] = [
  {
    email: 'testcplocation@testing.com',
    locationType: 'Care provider location',
    locationId: 'testcpl1',
    selectedLocationId: 'testcpl1',
  },
  {
    email: 'testcp@testing.com',
    locationType: 'Care provider',
    locationId: 'testcp1',
  },
  { email: 'testla@testing.com', locationType: 'LA', locationId: 'E08000025' },
];

const setupTestUsers = async () => {
  for (let user of test_users) {
    // Delete first
    await authDB
      .deleteFrom('user')
      .where('email', '=', user.email)
      .where('source', '=', TESTING_SOURCE)
      .execute();

    let selectedLocationId = null;
    if (process.env.LOCAL_AUTH_LOCATION_TYPE == 'LA') {
      selectedLocationId = process.env.LOCAL_AUTH_LOCATION_ID;
    }
    const rows = await authDB
      .insertInto('user')
      .values({
        id: generateId(),
        name: user.email,
        registeredName: user.email,
        email: user.email,
        registeredEmail: user.email,
        emailVerified: 1,
        locationId: user.locationId,
        locationType: user.locationType,
        selectedLocationId: selectedLocationId,
        selectedLocationDisplayName: null,
        selectedLocationCategory: null,
        marketingConsent: true,
        source: TESTING_SOURCE,
        role: 'member',
      })
      .execute();
  }
  authDB.destroy();
  console.log('✅ Test users updated successfully!');
};

setupTestUsers();
