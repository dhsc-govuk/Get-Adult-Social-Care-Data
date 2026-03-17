import { test, expect } from '@playwright/test';

// Password only required if connecting to live
const PROT_PW = process.env.PROTOTYPE_PASSWORD || '';
// Run local prototype with
// PORT=8000 npm run dev
const PROTOTYPE_HOME = 'http://localhost:8000';
const DEV_BASE = 'http://localhost:3000';
const INDEX_URL = `${PROTOTYPE_BASE}/pages`;
const DEV_AUTH_URL = `${DEV_BASE}/api/auth/local`;

// Update this to match the version of the prototype
const PROTOTYPE_BASE = PROTOTYPE_HOME + '/private-beta/2026/march';
// Explicit list of prototype paths to check against
const INCLUDED_PATHS = [
  '/help/',
  '/topics/',
  '/footer/',
  '/service-information/',
];

// Cleanup to remove differences we don't care about
const cleanAndSanitize = (text: string) => {
  return text
    .replace(
      /Data correct as of\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
      ''
    )
    .replace(/Data correct as of\s+[\d/]+(\s+[A-Za-z]+)?(\s+\d+)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

test('Audit prototype against implementation', async ({ page }) => {
  test.setTimeout(120_000);

  // Authenticate with Dev instance
  await page.goto(DEV_AUTH_URL);

  // Authenticate to prototype
  await page.goto(PROTOTYPE_HOME);
  if (await page.isVisible('input[type="password"]')) {
    await page.fill('input[type="password"]', PROT_PW);
    await page.click('button');
  }
  // Go to the "All Pages" list and get the links
  await page.goto(INDEX_URL);
  const paths = await page
    .locator('main a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

  // Filter out any nulls, external links
  const validPaths = paths.filter((path) => path && !path.startsWith('http'));
  expect(validPaths.length).not.toBe(0);

  let done = 0;
  for (const path of validPaths) {
    // Normalize the path (ensure it starts with /)
    let cleanPath = path?.startsWith('/') ? path : `/${path}`;

    let is_included = false;
    for (let included_path of INCLUDED_PATHS) {
      if (cleanPath && cleanPath.includes(included_path)) {
        is_included = true;
        break;
      }
    }
    if (!is_included) {
      continue;
    }

    // Capture Prototype Content
    console.log('Checking page: ', cleanPath);
    await page.goto(`${PROTOTYPE_BASE}${cleanPath}`);

    const protoContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return '';

      // Remove all <td> elements from the DOM temporarily
      const cells = main.querySelectorAll('td');
      cells.forEach((td) => td.remove());

      return main.innerText;
    });

    let devPath = cleanPath?.replace('/signed-in', '');
    devPath = devPath?.replace('/footer', '');
    // Capture Dev Content
    const devResponse = await page.goto(`${DEV_BASE}${devPath}`, {
      // not recommended by docs - workaround for react loading issues
      waitUntil: 'networkidle',
    });

    // Check page exists in dev
    test.expect
      .soft(devResponse?.status(), `Page not implemented: ${path}`)
      .toBe(200);

    const devContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return '';

      const cells = main.querySelectorAll('td');
      cells.forEach((td) => td.remove());

      return main.innerText;
    });

    // Using a soft assertion so the test doesn't stop at the first error
    test.expect
      .soft(cleanAndSanitize(devContent), `Text mismatch on ${cleanPath}`)
      .toBe(cleanAndSanitize(protoContent));
    done += 1;
  }
});
