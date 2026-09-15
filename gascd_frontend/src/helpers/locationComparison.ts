import { Indicator } from '@/data/interfaces/Indicator';
import { LocationNames } from '@/data/interfaces/LocationNames';
import IndicatorService from '@/services/indicator/IndicatorService';
import { DataPoint, Series } from '@/components/charts/TimeSeriesChart';
import { BarSeries } from '@/components/charts/GroupedBarChart';

/**
 * Shared derivations for the pages that compare a single metric across the
 * user's LA, their region and England. `DataTable` and the charts each want the
 * same figures in a different shape, so the reshaping lives here rather than
 * being repeated per page.
 */

/** The location types compared, in the order they are shown */
export const COMPARED_LOCATION_TYPES = ['LA', 'Regional', 'National'] as const;

export type ComparedLocationType = (typeof COMPARED_LOCATION_TYPES)[number];

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
 * One time series per compared location for a single metric, ready for
 * `TimeSeriesChart`.
 */
export const locationTimeSeries = (
  data: Indicator[],
  metricId: string,
  labels: LocationNames
): Series[] =>
  COMPARED_LOCATION_TYPES.map((locationType) => {
    const values: DataPoint[] = data
      .filter(
        (item) =>
          item.metric_id === metricId && item.location_type === locationType
      )
      .map((item) => ({
        date: IndicatorService.parseDate(item).toISOString(),
        value: item.data_point,
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    return { name: labelFor(locationType, labels), data: values };
  });

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
 * One bar series per compared location across a set of metrics, ready for
 * `GroupedBarChart`. `metricIds` fixes the category order.
 */
export const locationBarSeries = (
  data: Indicator[],
  metricIds: string[],
  labels: LocationNames
): BarSeries[] =>
  COMPARED_LOCATION_TYPES.map((locationType) => ({
    name: labelFor(locationType, labels),
    values: metricIds.map(
      (metricId) =>
        data.find(
          (item) =>
            item.metric_id === metricId && item.location_type === locationType
        )?.data_point ?? null
    ),
  }));
