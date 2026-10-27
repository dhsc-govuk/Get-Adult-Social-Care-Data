import { defineConfig, devices } from '@playwright/test';

// Screenshot tests: compare data page sections against committed baselines,
// using a fake data API (scripts/mock-data-api.ts) so values are repeatable.
//
// Needs the local User_DB and One Login simulator running, and the test users
// set up (npm run test:setupusers). See visual_tests/README.md.

const MOCK_DATA_API_ROOT = 'http://localhost:5055';

export default defineConfig({
  testDir: './visual_tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 120_000,

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      stylePath: './visual_tests/screenshot.css',
      // A ratio let a one-digit change in a long table pass, so allow no
      // differing pixels beyond the per-pixel colour threshold
      maxDiffPixels: 0,
      // The default 0.2 let a blue button turning dark green pass
      threshold: 0.05,
    },
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    viewport: { width: 1400, height: 900 },
    timezoneId: 'Europe/London',
    locale: 'en-GB',
  },

  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    {
      command: `DATA_API_ROOT=${MOCK_DATA_API_ROOT} npx tsx --conditions=react-server scripts/mock-data-api.ts`,
      port: 5055,
      reuseExistingServer: false,
    },
    {
      command: `DATA_API_ROOT=${MOCK_DATA_API_ROOT} npm run dev`,
      url: 'http://localhost:3000',
      // A server already on :3000 won't be using the fake data API
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
