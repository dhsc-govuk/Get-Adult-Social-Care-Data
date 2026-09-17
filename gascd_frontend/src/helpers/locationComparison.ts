import { Indicator } from '@/data/interfaces/Indicator';
import { LocationNames } from '@/data/interfaces/LocationNames';
import IndicatorService from '@/services/indicator/IndicatorService';
import { DataPoint, Series } from '@/components/charts/TimeSeriesChart';
import { BarSeries } from '@/components/charts/GroupedBarChart';
import { PEER_AVG_COLOUR } from '@/components/charts/peer-group/constants';
import { PEER_GROUP_LOCATION_TYPE } from '@/constants';

/**
 * Shared derivations for the pages that compare a single metric across the
 * user's LA, their region and England. `DataTable` and the charts each want the
 * same figures in a different shape, so the reshaping lives here rather than
 * being repeated per page.
 */

/** The location types compared, in the order they are shown */
export const COMPARED_LOCATION_TYPES = ['LA', 'Regional', 'National'] as const;

export type ComparedLocationType = (typeof COMPARED_LOCATION_TYPES)[number];

/**
 * The statistical peer group average is drawn on the charts as a further
 * comparator but has no column in the tables.
 */
export const PEER_GROUP_AVERAGE_LABEL =
  'Statistically similar peer group (average)';

/** The column labels for a comparison, with the averages spelled out */
export const comparisonLabels = (
  locationNames: LocationNames
): LocationNames => ({
  CPLabel: locationNames.CPLabel,
  LALabel: locationNames.LALabel || 'Local authority',
  RegionLabel: locationNames.RegionLabel
    ? `${locationNames.RegionLabel} (regional average)`
    : 'Regional average',
  CountryLabel: locationNames.CountryLabel
    ? `${locationNames.CountryLabel} (national average)`
    : 'National average',
});

export type ComparatorLaCounts = {
  /** Local authorities in the user's region */
  regional: number;
  /** Local authorities in England */
  national: number;
};

/**
 * INTERIM (GASCD-236). Turns comparator totals into per-authority averages.
 *
 * The Department for Education pipeline writes the Regional and National rows
 * as totals across local authorities, but the service presents them as
 * averages - so an England row reads 214,546 next to a single authority's
 * 3,756. Dividing by the number of authorities gives the mean the labels and
 * the designs describe.
 *
 * This belongs in the pipeline, alongside every other metric in the service,
 * which stores its comparator ready to display. It is here because the pages
 * shipped before that could be changed. To remove it, delete this function,
 * `ComparatorLaCounts`, `LocationService.getComparatorLaCounts`, the
 * `/api/get_la_counts` route, and the call sites on the two DfE pages.
 *
 * Applies only to the metrics named in `totalledMetricIds` - the counts. The
 * percentage and per-10,000 metrics are already rates and are passed through
 * untouched.
 *
 * Only an approximation of the mean: it assumes the stored total covers every
 * authority counted. Where an authority is missing from the data, the average
 * is understated.
 */
export const toLaAverages = (
  data: Indicator[],
  counts: ComparatorLaCounts | undefined | null,
  totalledMetricIds: string[]
): Indicator[] => {
  if (!counts) return data;
  const totalled = new Set(totalledMetricIds);

  return data.map((item) => {
    // Rates and percentages are already averages - only counts are totals
    if (!totalled.has(item.metric_id)) return item;

    const divisor =
      item.location_type === 'Regional'
        ? counts.regional
        : item.location_type === 'National'
          ? counts.national
          : 1;

    if (divisor <= 1 || item.data_point === null) return item;
    return { ...item, data_point: item.data_point / divisor };
  });
};

const labelFor = (
  locationType: ComparedLocationType,
  labels: LocationNames
): string =>
  locationType === 'LA'
    ? labels.LALabel
    : locationType === 'Regional'
      ? labels.RegionLabel
      : labels.CountryLabel;

/**
 * The regional and national series are averages the user's LA is compared
 * against, and the charts draw them differently from the LA itself.
 */
const isComparator = (locationType: ComparedLocationType): boolean =>
  locationType !== 'LA';

const timeSeriesFor = (
  data: Indicator[],
  metricId: string,
  locationType: string
): DataPoint[] =>
  data
    .filter(
      (item) =>
        item.metric_id === metricId && item.location_type === locationType
    )
    .map((item) => ({
      date: IndicatorService.parseDate(item).toISOString(),
      value: item.data_point,
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

const hasPeerGroup = (data: Indicator[], metricIds: string[]): boolean =>
  data.some(
    (item) =>
      item.location_type === PEER_GROUP_LOCATION_TYPE &&
      metricIds.includes(item.metric_id)
  );

/**
 * One time series per compared location for a single metric, ready for
 * `TimeSeriesChart`. The peer group average follows the other comparators when
 * the data has one, in the colour the benchmarking charts use for it.
 */
export const locationTimeSeries = (
  data: Indicator[],
  metricId: string,
  labels: LocationNames
): Series[] => {
  const series: Series[] = COMPARED_LOCATION_TYPES.map((locationType) => ({
    name: labelFor(locationType, labels),
    data: timeSeriesFor(data, metricId, locationType),
    comparator: isComparator(locationType),
  }));

  if (hasPeerGroup(data, [metricId])) {
    series.push({
      name: PEER_GROUP_AVERAGE_LABEL,
      data: timeSeriesFor(data, metricId, PEER_GROUP_LOCATION_TYPE),
      color: PEER_AVG_COLOUR,
      comparator: true,
    });
  }

  return series;
};

/**
 * The distinct dates a metric has values for, most recent first, as raw
 * `metric_date` values.
 */
export const seriesDates = (data: Indicator[], metricId: string): string[] =>
  Array.from(
    new Set(
      data
        .filter((item) => item.metric_id === metricId)
        .map((item) => String(item.metric_date))
    )
  ).sort((a, b) => Number(b) - Number(a));

export type PeriodRows = {
  /** Synthesised metric id to period label, most recent period first */
  rowHeaders: Record<string, string>;
  /** The same indicators, re-keyed to match `rowHeaders` */
  data: Indicator[];
};

/**
 * Turns a time series into one row per period, so a single metric over time can
 * be shown in `DataTable` with the compared locations as its columns. The
 * indicators are re-keyed to a synthesised `<metric id>_<date>` because
 * `DataTable` looks values up by metric id.
 */
export const periodRows = (
  data: Indicator[],
  metricId: string,
  periodLabel: (date: string) => string
): PeriodRows => {
  const dates = seriesDates(data, metricId);

  return {
    rowHeaders: Object.fromEntries(
      dates.map((date) => [`${metricId}_${date}`, periodLabel(date)])
    ),
    data: data
      .filter((item) => item.metric_id === metricId)
      .map((item) => ({
        ...item,
        metric_id: `${metricId}_${item.metric_date}`,
      })),
  };
};

/**
 * The peer group observations for the period the main data shows. For each
 * metric, the main data's latest observation fixes the date, and only the peer
 * row for that same date is kept. A peer series that is a year behind then
 * leaves a gap in the chart rather than a figure for the wrong year sitting
 * under the heading for the current one.
 */
export const peerRowsForLatestPeriod = (
  peerData: Indicator[],
  mainData: Indicator[]
): Indicator[] => {
  const latestByMetric = new Map<string, number>();
  mainData.forEach((item) => {
    if (item.location_type === PEER_GROUP_LOCATION_TYPE) return;
    const time = IndicatorService.parseDate(item).getTime();
    const current = latestByMetric.get(item.metric_id);
    if (current === undefined || time > current) {
      latestByMetric.set(item.metric_id, time);
    }
  });

  return peerData.filter(
    (item) =>
      item.location_type === PEER_GROUP_LOCATION_TYPE &&
      IndicatorService.parseDate(item).getTime() ===
        latestByMetric.get(item.metric_id)
  );
};

/**
 * One bar series per compared location across a set of metrics, ready for
 * `GroupedBarChart`. `metricIds` fixes the category order.
 */
export const locationBarSeries = (
  data: Indicator[],
  metricIds: string[],
  labels: LocationNames
): BarSeries[] => {
  const valuesFor = (locationType: string) =>
    metricIds.map(
      (metricId) =>
        data.find(
          (item) =>
            item.metric_id === metricId && item.location_type === locationType
        )?.data_point ?? null
    );

  const series: BarSeries[] = COMPARED_LOCATION_TYPES.map((locationType) => ({
    name: labelFor(locationType, labels),
    comparator: isComparator(locationType),
    values: valuesFor(locationType),
  }));

  if (hasPeerGroup(data, metricIds)) {
    series.push({
      name: PEER_GROUP_AVERAGE_LABEL,
      comparator: true,
      color: PEER_AVG_COLOUR,
      values: valuesFor(PEER_GROUP_LOCATION_TYPE),
    });
  }

  return series;
};
