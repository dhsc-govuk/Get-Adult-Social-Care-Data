import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env.AUTH_EMAIL = process.env.LOCAL_AUTH_EMAIL;
      return config;
    },
    experimentalModifyObstructiveThirdPartyCode: true,
    baseUrl: process.env.CYPRESS_BASE_URL,
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
    // Give nextjs a bit more time to respond
    defaultCommandTimeout: 10000,
  },
});
