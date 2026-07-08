import { test, expect } from '@playwright/test';

// 7 smoke checks per the GASCD migration test plan. Run with:
//   SMOKE_BASE_URL=https://dac-dhsc.dev/gascd-frontend-tst \
//   npx playwright test --config=playwright.smoke.config.ts
//
// Tests 1, 2, 5, 7 run unauthenticated and always execute.
// Tests 3, 4, 6 require a captured Playwright storage state (One Login is
// interactive and can't be scripted without test credentials). To enable them:
//   1. Run: npx playwright test smoke_tests/smoke.spec.ts:_capture_auth_state --headed
//      (or capture manually - see smoke_tests/AUTH_SETUP.md)
//   2. Set SMOKE_STORAGE_STATE=./smoke_tests/.auth/state.json
//   3. Re-run the suite.

const BASE_URL = process.env.SMOKE_BASE_URL ?? '';
const SKIP_AUTH = !process.env.SMOKE_STORAGE_STATE;

test.beforeAll(() => {
  if (!BASE_URL) {
    throw new Error('SMOKE_BASE_URL not set (e.g. https://dac-dhsc.dev/gascd-frontend-tst)');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. App reachable at env URL
// ─────────────────────────────────────────────────────────────────────────────
test('1. app reachable at env URL', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'no response from server').toBeTruthy();
  expect(response!.status(), `unexpected status ${response!.status()}`).toBeLessThan(500);
  // The app may redirect /  ->  /home  ->  /login. As long as we land somewhere
  // in the app (not a third-party error page), pass.
  await expect(page).toHaveURL(new RegExp(BASE_URL.replace(/\W/g, '\\$&')));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. One Login sign-in round-trip (initiation only - completing the round-trip
//    requires test creds that One Login doesn't make scriptable. We verify our
//    side: clicking the button redirects to One Login with correct OIDC params.)
// ─────────────────────────────────────────────────────────────────────────────
test('2. One Login sign-in initiates with correct OIDC params', async ({ page, context }) => {
  // Don't follow the cross-origin redirect into oidc.integration.account.gov.uk
  // (it leaves our domain and we can't easily assert there). Instead, capture
  // the Location header from the OAuth-init response.
  let oidcUrl: string | null = null;
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/auth/sign-in/oauth2')) {
      const loc = resp.headers()['location'];
      if (loc && loc.includes('oidc.integration.account.gov.uk')) {
        oidcUrl = loc;
      }
    }
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Click the GOV.UK One Login button. Adjust the selector if the label differs.
  const oneLoginBtn = page.getByRole('button', { name: /one login/i }).or(
    page.getByRole('link', { name: /one login/i })
  );
  await expect(oneLoginBtn, 'One Login button not found on /login').toBeVisible({ timeout: 10_000 });

  // Stop the navigation away from our origin once we see the OIDC URL
  await Promise.race([
    page.waitForURL(/oidc\.integration\.account\.gov\.uk/, { timeout: 15_000 }).catch(() => {}),
    oneLoginBtn.click(),
  ]);

  const target = oidcUrl ?? page.url();
  expect(target, 'never saw redirect to One Login').toContain('oidc.integration.account.gov.uk');

  const parsed = new URL(target);
  expect(parsed.searchParams.get('client_id'), 'client_id missing').toBeTruthy();
  expect(parsed.searchParams.get('redirect_uri'), 'redirect_uri missing').toBeTruthy();
  expect(
    decodeURIComponent(parsed.searchParams.get('redirect_uri') ?? ''),
    'redirect_uri does not include basePath /api/auth/oauth2/callback/govuk-one-login'
  ).toMatch(/\/api\/auth\/oauth2\/callback\/govuk-one-login$/);
  expect(parsed.searchParams.get('scope'), 'scope missing').toContain('openid');
  expect(parsed.searchParams.get('response_type'), 'response_type missing').toBe('code');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Dashboard renders post-login  (requires authenticated session)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('authenticated journeys', () => {
  test.skip(SKIP_AUTH, 'SMOKE_STORAGE_STATE not set - no authenticated session available');

  test('3. dashboard /home renders post-login', async ({ page }) => {
    const response = await page.goto('/home');
    expect(response?.status()).toBe(200);
    // Page should render service-name "Get adult social care data" and topic tiles.
    await expect(page.getByRole('heading', { name: /get adult social care data/i })).toBeVisible();
    // At least one topic tile from the home page topics list
    await expect(
      page.getByRole('heading', { name: /care provision|funding|population needs/i }).first()
    ).toBeVisible();
  });

  test('4. a metric / data page renders real data', async ({ page }) => {
    // Pick a known-stable data page populated by the data load
    await page.goto('/topics/residential-care/provision-and-occupancy/data');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The page should have data content - not the spinner/empty-state for too long.
    // Tighten the assertion below to a known string that only renders when data is loaded.
    const body = page.locator('main');
    await expect(body).not.toHaveText(/no data available|loading/i, { timeout: 15_000 });
  });

  test('6. logout clears session', async ({ page, context }) => {
    await page.goto('/home');
    // Click the logout link/button - selector may need tweaking depending on header markup
    const logout = page.getByRole('link', { name: /sign out|log out/i }).or(
      page.getByRole('button', { name: /sign out|log out/i })
    );
    await expect(logout).toBeVisible();
    await logout.click();
    // Should land on signed-out or login page
    await page.waitForURL(/\/(signed-out|login)/, { timeout: 10_000 });
    // Auth cookie should be gone or empty
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => /better-auth.session|session_token/i.test(c.name));
    expect(sessionCookie?.value ?? '').toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Auth gate works  (no auth - unauthenticated user gets bounced to login)
// ─────────────────────────────────────────────────────────────────────────────
test('5. protected page bounces unauthenticated user to /login', async ({ browser }) => {
  // Use a fresh context so we don't accidentally have a stored session.
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  await page.goto(BASE_URL + '/home');
  // Redirect chain should end at /login
  await page.waitForURL(/\/login(\?|$)/, { timeout: 10_000 });
  await context.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Error page  (a bad URL renders the 404 / error page, no stack trace)
// ─────────────────────────────────────────────────────────────────────────────
test('7. unknown route renders 404 with no stack trace', async ({ page }) => {
  const response = await page.goto('/this-route-definitely-does-not-exist-xyz123');
  expect(response?.status(), 'expected a 404 for unknown route').toBe(404);
  const body = await page.content();
  // Heuristic: a leaked Node/Next stack trace would contain "at " followed by
  // a path/line, or "Error:" with file paths. The user-facing 404 page should
  // not contain either.
  expect(body, 'response leaked a stack trace').not.toMatch(/^\s*at\s+\S+:\d+/m);
  expect(body, 'response leaked stack-like Error:').not.toMatch(/Error:.*\bat\s+.*:\d+/);
  // Should still render the GOV.UK 404 page chrome.
  await expect(page.getByText(/page not found|404/i)).toBeVisible();
});
