import { expect, test as setup } from '@playwright/test';
import { AUTH_FILES, TestUser } from './users';

const signIn = (user: TestUser) =>
  setup(`sign in as ${user}`, async ({ page }) => {
    // Wait for hydration: submitting before React attaches the handler does nothing
    await page.goto('/whoami', { waitUntil: 'networkidle' });
    await page.locator('input[value="u:cqc"]').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.locator('input#sub').fill(AUTH_FILES[user].email);
    await page.locator('input#email').fill(AUTH_FILES[user].email);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForURL('**/home');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.context().storageState({ path: AUTH_FILES[user].path });
  });

signIn('careProviderLocation');
signIn('localAuthority');
