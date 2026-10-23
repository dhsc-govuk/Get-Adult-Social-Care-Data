import fs from 'fs';
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
  // Care home users get extra rows, so the page is checked without them too
  {
    name: 'provision-and-occupancy-la',
    url: '/topics/residential-care/provision-and-occupancy/data',
    user: 'localAuthority',
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

const SCREENSHOT_TAB_TYPES = ['map', 'chart', 'graph', 'table'];

const downloadCsvs = async (page: Page, panelId: string) => {
  const links = page.locator(`#${panelId}`).getByText(/^Export .* \(CSV\)$/);
  const csvs: string[] = [];
  for (let l = 0; l < (await links.count()); l++) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      links.nth(l).click(),
    ]);
    const content = fs.readFileSync(await download.path(), 'utf8');
    csvs.push(`# ${download.suggestedFilename()}\n${content}`);
  }
  return csvs;
};

const waitForSectionToSettle = async (page: Page, panelId: string) => {
  const panel = page.locator(`#${panelId}`);
  await expect(panel).toBeVisible();
  // Long enough for the dev server to compile the data routes on first use
  await expect(panel).not.toContainText(/Loading/, { timeout: 30_000 });
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
      const csvs: string[] = [];

      for (let i = 0; i < sectionCount; i++) {
        const section = sections.nth(i);
        const tabs = section.locator('a.govuk-tabs__tab');

        for (let t = 0; t < (await tabs.count()); t++) {
          const panelId = (await tabs.nth(t).getAttribute('href'))!.slice(1);
          const tabType = panelId.split('-')[0];

          if (tabType === 'download') {
            await tabs.nth(t).click();
            csvs.push(...(await downloadCsvs(page, panelId)));
          } else if (SCREENSHOT_TAB_TYPES.includes(tabType)) {
            await tabs.nth(t).click();
            await waitForSectionToSettle(page, panelId);
            await expect(section).toHaveScreenshot(`${name}-${panelId}.png`);
          }
        }
      }

      // Screenshots show link text but not where links go
      const links = await page
        .locator('#main-content a[href]')
        .evaluateAll((anchors) =>
          anchors
            .map((a) => a.getAttribute('href'))
            .filter((href) => href && !href.startsWith('#'))
        );
      expect.soft(links.join('\n')).toMatchSnapshot(`${name}-links.txt`);
      expect(csvs.join('\n')).toMatchSnapshot(`${name}-downloads.txt`);
    });
  });
}
