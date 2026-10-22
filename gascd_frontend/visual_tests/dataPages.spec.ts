import { expect, Page, test } from '@playwright/test';
import { AUTH_FILES, TestUser } from './users';

// Add a page here before moving it onto the shared components
const PAGES: { name: string; url: string; user: TestUser }[] = [
  {
    name: 'financial-spend',
    url: '/topics/financial-spend-and-unpaid-care/financial-spend/data',
    user: 'careProviderLocation',
  },
  {
    name: 'la-funding-planning',
    url: '/topics/future-planning/la-funding-planning/data',
    user: 'localAuthority',
  },
  {
    name: 'children-in-need',
    url: '/topics/future-planning/children-in-need/data',
    user: 'careProviderLocation',
  },
  {
    name: 'sen-and-ehcp',
    url: '/topics/future-planning/sen-and-ehcp/data',
    user: 'careProviderLocation',
  },
  {
    name: 'dementia-prevalence',
    url: '/topics/population-needs/dementia-prevalence/data',
    user: 'careProviderLocation',
  },
  {
    name: 'disability-prevalence',
    url: '/topics/population-needs/disability-prevalence/data',
    user: 'careProviderLocation',
  },
  {
    name: 'household-composition-and-economic-factors',
    url: '/topics/population-needs/household-composition-and-economic-factors/data',
    user: 'careProviderLocation',
  },
  {
    name: 'population-age-and-size',
    url: '/topics/population-needs/population-age-and-size/data',
    user: 'careProviderLocation',
  },
  {
    name: 'number-of-people-receiving-care',
    url: '/topics/residential-care/number-of-people-receiving-care/data',
    user: 'careProviderLocation',
  },
  {
    name: 'provision-and-occupancy',
    url: '/topics/residential-care/provision-and-occupancy/data',
    user: 'careProviderLocation',
  },
  {
    name: 'residential-care-providers',
    url: '/topics/residential-care/residential-care-providers/data',
    user: 'careProviderLocation',
  },
  {
    name: 'unpaid-care',
    url: '/topics/residential-care/unpaid-care/data',
    user: 'careProviderLocation',
  },
];

// Download panels are text only, so they're left out
const TAB_TYPES = ['map', 'chart', 'graph', 'table'];

const waitForSectionToSettle = async (page: Page, panelId: string) => {
  const panel = page.locator(`#${panelId}`);
  await expect(panel).toBeVisible();
  // Some panels never stop saying "Loading" (e.g. PeerGroupTable's duplicate
  // row keys); a slow load still fails the screenshot comparison
  await expect(panel)
    .not.toContainText(/Loading/, { timeout: 5_000 })
    .catch(() => {});
  if (await panel.locator('.js-plotly-plot').count()) {
    await expect(
      panel.locator('.js-plotly-plot .main-svg').first()
    ).toBeVisible();
  }
  // Plotly redraws once after resizing to its container
  await page.waitForTimeout(500);
};

for (const { name, url, user } of PAGES) {
  test.describe(() => {
    test.use({ storageState: AUTH_FILES[user].path });

    test(name, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const sections = page.locator('.data-box');
      const sectionCount = await sections.count();
      expect(sectionCount).toBeGreaterThan(0);

      for (let i = 0; i < sectionCount; i++) {
        const section = sections.nth(i);
        const tabs = section.locator('a.govuk-tabs__tab');

        for (let t = 0; t < (await tabs.count()); t++) {
          const panelId = (await tabs.nth(t).getAttribute('href'))!.slice(1);
          const tabType = panelId.split('-')[0];
          if (!TAB_TYPES.includes(tabType)) continue;

          await tabs.nth(t).click();
          await waitForSectionToSettle(page, panelId);
          await expect(section).toHaveScreenshot(`${name}-${panelId}.png`);
        }
      }
    });
  });
}
