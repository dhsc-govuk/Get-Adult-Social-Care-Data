# Screenshot tests

These compare each section of a data page (chart, table and map tabs) against committed screenshots, so a refactor that changes how a page looks fails the test.

The data comes from a fake data API (`scripts/mock-data-api.ts`), not a database. Values differ by metric, location and date, but are the same on every run. They use each metric's frequency and value range from `gascd_api/DataGeneration/data/metric_data.csv`.

## Before you run them

1. Start the user DB and One Login simulator: `docker compose up userdb onelogin_simulator -d`
2. Set up the test users: `npm run test:setupusers`
3. Install the browser once: `npx playwright install chromium`
4. Stop any dev server on port 3000. The tests start their own, pointed at the fake data API on port 5055.

## Running

- `npm run test:visual` compares against the committed screenshots.
- `npm run test:visual:update` rewrites them. Only do this when a visual change is intentional, and check the new images in the PR.

When a test fails, `npx playwright show-report` shows the expected, actual and diff images.

## Adding a page

Add it to `PAGES` in `dataPages.spec.ts`, with the test user who can see it (`users.ts`), and run `npm run test:visual:update`. Do this before moving a page onto the shared components, so the refactor PR can show it looks the same.

## Known limits

- The screenshots are taken on macOS (files end `-darwin.png`). Linux renders fonts differently, so running these in CI will need its own Linux baselines.
- The data is fake, so these check layout and wording, not whether the right value is in the right cell. Unit tests cover that.
