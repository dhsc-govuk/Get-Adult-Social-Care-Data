import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {},
    experimentalOriginDependencies: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    baseUrl: process.env.CYPRESS_BASE_URL,
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
  },
});
