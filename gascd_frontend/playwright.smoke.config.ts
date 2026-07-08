import { defineConfig, devices } from '@playwright/test';

// Config for env-targeted smoke tests. Runs against a deployed environment
// (tst / prd), no local dev server. Targets are set via env vars so the same
// suite runs against every env from CI or locally.
//
// Required:
//   SMOKE_BASE_URL    Full app URL incl. basePath, e.g.
//                     https://dac-dhsc.dev/gascd-frontend-tst
//
// Optional:
//   SMOKE_STORAGE_STATE   Path to a Playwright storage-state JSON
//                         (captures an authenticated session for the auth-gated
//                         tests; see scripts/smoke-auth-setup.md). If unset,
//                         the auth-gated tests are skipped.
//   CI                    Enables retries + serial execution

export default defineConfig({
  testDir: './smoke_tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.SMOKE_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: process.env.SMOKE_STORAGE_STATE || undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
