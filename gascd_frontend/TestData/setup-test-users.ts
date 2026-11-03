import 'dotenv/config';
import { authDB } from '@/lib/auth';
import { generateId } from 'better-auth';
import { GRANT_SCOPE_LA } from '@/lib/userAccess';
import {
  GRANT_ROLE_APPROVER,
  GRANT_ROLE_READER,
  GRANT_SCOPE_LOCATION,
  GRANT_SCOPE_PROVIDER,
  GRANT_STATUS_ACTIVE,
} from '@/lib/manageUsers';

const TESTING_SOURCE = '__testing__';

interface TestUser {
  email: string;
  locationId: string;
  locationType: string;
  selectedLocationId?: string;
  selectedLocationCategory?: string;
  // Users need a live grant to be let in
  grant: {
    scope_type: string;
    role: string;
    basis: string;
    provider_code?: string;
    location_code?: string;
    la_code?: string;
  };
}

const test_users: TestUser[] = [
  {
    email: 'testcplocation@testing.com',
    locationType: 'Care provider location',
    locationId: 'testcpl1',
    selectedLocationId: 'testcpl1',
    selectedLocationCategory: 'residential',
    grant: {
      scope_type: GRANT_SCOPE_LOCATION,
      role: GRANT_ROLE_APPROVER,
      basis: 'registered_manager',
      // The mock location's provider
      provider_code: 'testcp2',
      location_code: 'testcpl1',
    },
  },
  {
    email: 'testcp@testing.com',
    locationType: 'Care provider',
    locationId: 'testcp1',
    grant: {
      scope_type: GRANT_SCOPE_PROVIDER,
      role: GRANT_ROLE_APPROVER,
      basis: 'nominated_individual',
      provider_code: 'testcp1',
    },
  },
  {
    email: 'testla@testing.com',
    locationType: 'LA',
    locationId: 'E08000025',
    grant: {
      scope_type: GRANT_SCOPE_LA,
      role: GRANT_ROLE_READER,
      basis: 'la_user',
      la_code: 'E08000025',
    },
  },
];

const setupTestUsers = async () => {
  for (let user of test_users) {
    // Delete first
    const existing = await authDB
      .selectFrom('user')
      .select('id')
      .where('email', '=', user.email)
      .where('source', '=', TESTING_SOURCE)
      .execute();
    if (existing.length) {
      await authDB
        .deleteFrom('access_grant')
        .where(
          'user_id',
          'in',
          existing.map((row) => row.id)
        )
        .execute();
    }
    await authDB
      .deleteFrom('user')
      .where('email', '=', user.email)
      .where('source', '=', TESTING_SOURCE)
      .execute();

    let selectedLocationId = user.selectedLocationId;
    if (user.locationType == 'LA') {
      selectedLocationId = user.locationId;
    }
    const id = generateId();
    await authDB
      .insertInto('user')
      .values({
        id,
        name: user.email,
        registeredName: user.email,
        email: user.email,
        registeredEmail: user.email,
        emailVerified: 1,
        locationId: user.locationId,
        locationType: user.locationType,
        selectedLocationId: selectedLocationId,
        selectedLocationDisplayName: null,
        selectedLocationCategory: user.selectedLocationCategory,
        marketingConsent: true,
        termsAccepted: true,
        source: TESTING_SOURCE,
        role: 'member',
      })
      .execute();
    await authDB
      .insertInto('access_grant')
      .values({
        user_id: id,
        provider_code: null,
        location_code: null,
        la_code: null,
        ...user.grant,
        status: GRANT_STATUS_ACTIVE,
        source: TESTING_SOURCE,
        granted_at: new Date(),
      })
      .execute();
  }
  authDB.destroy();
  console.log('✅ Test users updated successfully!');
};

setupTestUsers();
