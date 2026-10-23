// Emails match users in TestData/setup-test-users.ts
export const AUTH_FILES = {
  careProviderLocation: {
    email: 'testcplocation@testing.com',
    path: 'playwright/.auth/care-provider-location.json',
  },
  localAuthority: {
    email: 'testla@testing.com',
    path: 'playwright/.auth/local-authority.json',
  },
};

export type TestUser = keyof typeof AUTH_FILES;
