# Adding a metric

How to add a new metric to the service and show it on a data page, using the shared metric config and components (GASCD-350 to 354).

## Checklist

1. [API](#1-the-api): the metric's table, model and code
2. [Metric config](#2-the-metric-config): label, format, source and help page
3. [Sharing and access](#3-sharing-and-access): sharing category, help page and any access restriction
4. [Show it on a page](#4-show-it-on-a-page): `MetricSection`, or the shared chart and table
5. [Test it](#5-test-it): unit tests and the screenshot tests

## 1. The API

Each metric is its own table in the data database. In `gascd_api`:

- Add the code to `api/Data/Shared/MetricCodeEnum.cs`.
- Add a model in `api/Data/Models/Metrics/TimeSeries/`, named after the table, for example:

  ```cs
  [Table("num_children_in_need")]
  public class NumChildrenInNeed : MetricTimeSeries
  {
  }
  ```

- Add its `DbSet` to `api/Data/GascdDataContext.cs` and create a migration.
- For local test data, add the metric to `DataGeneration/data/metric_groups.csv`, and a row to `DataGeneration/data/metric_data.csv`. Its columns (no header row) are the metric group, metric code, frequency, location types, minimum and maximum value:

  ```
  num_children_in_need,num_children_in_need,Yearly,LA-National-Regional,1500,12000
  ```

  The frontend's screenshot tests read the same file for their fake data (frequency and value range), so add it before recording screenshots.

The real data is loaded into each environment by the data pipeline, outside this repo.

## 2. The metric config

Add the metric to `METRICS` in `src/config/metrics.ts`:

```ts
num_children_in_need: {
  label: 'Children in need',
  format: 'number', // 'number' | 'percentage' | 'currency'
  source: SOURCES.dfeChildrenInNeed,
  helpUrl: '/help/children-in-need',
},
```

- **`label`** is the row label in tables and the default figure title.
- **`format`** sets how every chart and table shows the value: `%` for `percentage`, `£` for `currency`. There is no default, so a chart or table cannot show the wrong format by omission.
- **`source`** is the source line under charts and tables. Add the citation to `SOURCES` if it's new, so it's written once.
- **`helpUrl`** is the metric's help page (see below).

Metric ids are checked: a table given an id in `metrics` that isn't in `METRICS` won't compile, and a chart or `PeerGroupTable` given one throws when it renders, rather than guessing a format.

Related metrics with a per 100,000 twin (the primary support reasons, the financial spend metrics) are generated from one list near the top of the file. Add to that list rather than writing both entries by hand.

## 3. Sharing and access

- **Sharing category**: add the metric to `METRIC_SHARING_CATEGORIES` in `src/data/sharingCategories.ts`, using the category agreed in the GASCD Methodology spreadsheet. A metric missing from the list falls back to the most restrictive category.
- **Help page**: add `app/(protected)/help/<slug>/page.tsx`, a card for it on `app/(protected)/service-information/data-indicator-details/page.tsx`, and an entry in `HELP_PAGE_SHARING` naming its sharing reason. A unit test checks every page on the indicator details page has an entry.
- **Access**: if the metric is only for some user types (as PANSI is only for LAs), add a rule to `canAccessMetric` in `src/lib/permissions.ts`.

## 4. Show it on a page

### One metric compared with its peer group: `MetricSection`

If the section is one metric compared with the user's region, England and a comparison group (a peer group chart, a table of the areas and a CSV download), use `MetricSection` (`src/components/data-components/MetricSection.tsx`). Unpaid care is the simplest example:

```tsx
<MetricSection
  id="1" // tab ids: chart-1, table-1, download-1
  title="People aged 5 and over who provide unpaid care"
  metric={UNPAID_CARE}
  intro={
    <p className="govuk-body-m">
      Find out{' '}
      <a
        href={withBasePath(METRICS[UNPAID_CARE].helpUrl)}
        className="govuk-link"
      >
        how unpaid care is measured.
      </a>
    </p>
  }
  figureNumber={1}
  metricDescription="the percentage of people aged 5 and over who provide unpaid care"
  tableCaption={/* Table 1: ... */}
  columnHeaders={tableColumnHeaders}
  download={{
    filename: 'percent_unpaid_care.csv',
    description: 'percentage of people aged 5 and over who provide unpaid care',
  }}
  data={filteredDemographicData}
  laCode={locationIds[1]}
  laName={locationNames.LALabel}
  regionLabel={locationNames.RegionLabel}
  comparator={comparator}
  peer={{ dataByMetric, loading: chartLoading, error: chartError }}
/>
```

It adds the comparison group to each tab and the "Interpreting the NHS Peer Group" text, and takes the figure title, row label, format and source from the config. Optional props: `figureTitle` (defaults to the label), `dateLabel`, `sharingMetricIds` (defaults to the metric) and `chartControl` (a select beside the comparison group on the chart).

The page provides the data and the comparison group, once for all its sections:

```tsx
const comparator = useComparatorControls({ laCode, metricPage });
const {
  dataByMetric,
  loading: peerLoading,
  error: peerError,
} = usePeerGroupData(
  laCode,
  metricIds,
  comparator.selection,
  comparator.groups
);
// The chart also needs the page's own LA, region and England data
const chartLoading = peerLoading || baseDataStatus === 'loading';
const chartError = peerError || baseDataStatus === 'error';
// The comparator average joins the LA, region and England rows
const filteredDemographicData = useMemo(
  () =>
    mergeComparatorAverage(
      baseDemographicData,
      metricIds,
      dataByMetric,
      regionCode
    ),
  [baseDemographicData, dataByMetric, regionCode]
);
```

See `app/(protected)/topics/residential-care/unpaid-care/data/page.tsx` for the whole page.

### Anything else: the shared chart and table

Sections that don't fit (several metrics in one table, a ranked list of LAs, filters, a trend over time) are built from the same pieces. Each takes the metric and reads its format and source from the config:

| Component                       | Use                                                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PeerGroupBarChart` (`metric`)  | LA against its comparison group, region and England. Pass `{...chartLocationValues(data, metric)}` for the LA, region and England values.                                     |
| `PeerGroupTable` (`metric`)     | The same as a ranked table                                                                                                                                                    |
| `DataTable` (`metrics`)         | One row per metric, a column per area. Row labels, `%`/`£` and source come from the config. Use `rowHeaders` instead for rows that aren't one per metric (one per year, say). |
| `SubCatergoryTable` (`metrics`) | As `DataTable`, with total rows                                                                                                                                               |
| `TimeSeriesChart` (`metric`)    | A trend over time; the y axis `£` or `%` comes from the metric                                                                                                                |
| `TimeSeriesTable` (`metrics`)   | The same as a table                                                                                                                                                           |
| `SectionControls`               | Comparison group, other selects and filters above a divider (GASCD-300)                                                                                                       |

A filter shown in more than one tab needs `useFilterSync` (`src/components/filters/useFilterSync.ts`) so the copies stay in step, and an `idPrefix` per tab so element ids stay unique. See the care home bed numbers section on the provision and occupancy page.

`locationValues(data, metricId)` gives a metric's LA, region and England values for anything else that needs them.

## 5. Test it

- **Unit tests**: `npm test` (use Node 24, e.g. `mise exec node@24.4.1 -- npm test`). The help page sharing test catches a help page without a sharing entry, and the type check catches an unknown metric id in a table.
- **Screenshot tests**: see [visual_tests/README.md](./visual_tests/README.md). They check each page's look, links and CSV downloads against fake data.
  - A new section on an existing page: run `npm run test:visual:update`, then check that only that page's new and changed files are in the diff.
  - A new page: add it to `PAGES` in `visual_tests/dataPages.spec.ts` (with a second entry if what it shows depends on the type of user) and record it the same way.
  - A change that shouldn't change how anything looks: run `npm run test:visual`. It must pass with no changes. The tests allow no differing pixels, so even a single changed digit, or a colour change such as a blue button turning green, fails.
