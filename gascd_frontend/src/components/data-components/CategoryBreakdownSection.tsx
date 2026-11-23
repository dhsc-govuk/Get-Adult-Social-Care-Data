'use client';
import React, { useRef } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import NhsPeerGroupDetails from '@/components/data-components/NhsPeerGroupDetails';
import CategoryBreakdownTable from '@/components/tables/CategoryBreakdownTable';
import StackedBarChart from '@/components/charts/StackedBarChart';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { Indicator } from '@/data/interfaces/Indicator';
import { METRICS, MetricId } from '@/config/metrics';
import {
  BreakdownBar,
  BreakdownCategory,
  ChartBreakdownCategory,
  FOOTNOTE_MARKER,
  breakdownBars,
  breakdownValue,
} from '@/helpers/categoryBreakdown';

type CommonProps = {
  // Tab ids within the page, e.g. "1" for table-1, chart-1 and download-1
  id: string;
  title: string;
  // The "Find out how ... is calculated" text above the tabs
  intro: React.ReactNode;
  // Defaults to every metric in the categories and the total
  sharingMetricIds?: string[];
  // The heading of the table's first column, e.g. "CQC rating"
  categoryColumnName: string;
  total: { label: string; metric: MetricId };
  // The page's metric data, with the comparison group's totals merged in
  data: Indicator[];
  columnHeaders: Object;
  tableCaption: React.ReactNode;
  // Explains the user's LA's figures. Shown below the table and the chart,
  // and marked against the LA's name in both
  laNote?: React.ReactNode;
  // `notes` are lines placed above the data, e.g. its date and source
  download: { filename: string; description: string; notes?: string[] };
  comparator: ComparatorControls;
};

type ChartProps = {
  categories: ChartBreakdownCategory[];
  // The bars of the chart, e.g. the user's LA, the comparison group and England
  bars: BreakdownBar[];
  laName: string;
  figureNumber: number;
  // What the figure shows, e.g. "number and percentage of adult social care
  // locations by CQC rating"
  figureTitle: string;
  // Follows the figure title, naming the locations and period as the table
  // caption does
  comparisonSummary: React.ReactNode;
  loading: boolean;
  error: boolean;
};

// A section with no chart leaves out all of the chart's props
type TableOnlyProps = { categories: BreakdownCategory[] } & {
  [Key in Exclude<keyof ChartProps, 'categories'>]?: undefined;
};

type Props = CommonProps & (ChartProps | TableOnlyProps);

/**
 * A whole split into categories (a count and a percentage per category) for
 * the user's LA, their comparison group and England: a table, a stacked bar
 * chart and a CSV download. The table comes first, as the figures are read
 * from it and the chart shows the shares at a glance. Without `bars` there is
 * no chart tab.
 */
const CategoryBreakdownSection: React.FC<Props> = ({
  id,
  title,
  intro,
  sharingMetricIds,
  categoryColumnName,
  categories,
  total,
  data,
  columnHeaders,
  bars,
  laName,
  figureNumber,
  figureTitle,
  comparisonSummary,
  tableCaption,
  laNote,
  download,
  comparator,
  loading,
  error,
}) => {
  const tableref = useRef<HTMLTableElement>(null);
  const metricIds = sharingMetricIds ?? [
    ...categories.map((category) => category.countMetric),
    ...categories.map((category) => category.percentageMetric),
    total.metric,
  ];
  // The chart benchmarks the user's own LA, so it is only complete once the
  // LA's own total has resolved
  const hasLaData = breakdownValue(data, total.metric, 'LA') !== null;
  const marker = laNote ? FOOTNOTE_MARKER : '';
  const chart =
    bars &&
    breakdownBars(
      data,
      categories,
      bars.map((bar) =>
        bar.locationType === 'LA'
          ? { ...bar, label: `${bar.label}${marker}` }
          : bar
      )
    );
  const note = laNote && (
    <p className="govuk-body">
      {FOOTNOTE_MARKER}
      {laNote}
    </p>
  );

  return (
    <DataBox
      dataTitle={title}
      dataInfo={
        <>
          {intro}
          <NhsPeerGroupDetails />
        </>
      }
    >
      <DataTabs
        id={id}
        order={['table', 'chart', 'download']}
        sharingMetricIds={metricIds}
        table={
          <>
            {comparator.renderComparatorControl(`comparator-table-${id}`)}
            <CategoryBreakdownTable
              tableref={tableref}
              caption={tableCaption}
              columnHeaders={
                laNote
                  ? {
                      ...columnHeaders,
                      LALabel: `${(columnHeaders as { LALabel?: string }).LALabel}${marker}`,
                    }
                  : columnHeaders
              }
              categoryColumnName={categoryColumnName}
              categories={categories}
              total={total}
              data={data}
            >
              {note}
            </CategoryBreakdownTable>
          </>
        }
        chart={
          chart && (
            <>
              {comparator.renderComparatorControl(`comparator-chart-${id}`)}
              <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-top-4">
                Figure {figureNumber}: {figureTitle} &ndash; {comparisonSummary}
              </p>
              <p className="govuk-body">
                Hover over or select each bar to see the exact number and
                percentage.
              </p>
              {loading && <p className="govuk-body">Loading...</p>}
              {!loading && (error || !hasLaData) && (
                <p className="govuk-body">Data not available</p>
              )}
              {!loading && !error && hasLaData && (
                <StackedBarChart
                  categories={chart.categories}
                  segments={chart.segments}
                  highlightCategory={`${laName}${marker}`}
                  height={Math.max(250, chart.categories.length * 70 + 80)}
                />
              )}
              {note}
              <p className="govuk-body">
                Source: {METRICS[total.metric].source}
              </p>
            </>
          )
        }
        download={
          <>
            <div className="govuk-!-margin-bottom-4">
              {comparator.renderComparatorControl(`comparator-download-${id}`)}
            </div>
            <DownloadTableDataCSVLink
              tableref={tableref}
              filename={download.filename}
              xLabel=""
              downloadType={download.description}
              notes={download.notes}
            />
          </>
        }
      />
    </DataBox>
  );
};

export default CategoryBreakdownSection;
