import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

export default defineConfig({
  e2e: {
    env: {
      // These need to match the users in setup-test-users.ts
      cpl_user: 'testcplocation@testing.com',
      cp_user: 'testcp@testing.com',
      la_user: 'testla@testing.com',
    },
    setupNodeEvents(on, config) {},
    experimentalModifyObstructiveThirdPartyCode: true,
    baseUrl: process.env.CYPRESS_BASE_URL,
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
    // Give nextjs a bit more time to respond
    defaultCommandTimeout: 10000,
  },
});
