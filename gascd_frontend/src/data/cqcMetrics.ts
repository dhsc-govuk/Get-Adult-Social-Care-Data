/**
 * Metric ids and shared labelling for the CQC ratings of adult social care
 * locations.
 *
 * Held in one place because the same ids are needed by the data page, the
 * sharing categorisation and the tests. The ids themselves are declared once,
 * with their labels and formats, in `@/config/metrics`.
 */

import {
  ALL_CQC_SERVICE_TYPES,
  CQC_RATINGS,
  CQC_SERVICE_TYPES,
  CqcRatingId,
  CqcServiceTypeId,
  METRICS,
  NUM_CQC_INSPECTED_LOCATIONS,
  NUM_CQC_LOCATIONS,
  NUM_CQC_UNINSPECTED_LOCATIONS,
  PERC_CQC_INSPECTED_LOCATIONS,
  PERC_CQC_UNINSPECTED_LOCATIONS,
  cqcInspectedCountMetricId,
  cqcRatingCountMetricId,
  numCqcRatingMetricId,
  percCqcRatingMetricId,
} from '@/config/metrics';
import {
  BreakdownCategory,
  ChartBreakdownCategory,
} from '@/helpers/categoryBreakdown';
import { FilterGroup } from '@/components/filters/FilterPanel';

export {
  ALL_CQC_SERVICE_TYPES,
  CQC_SERVICE_TYPES,
  NUM_CQC_INSPECTED_LOCATIONS,
  NUM_CQC_LOCATIONS,
  cqcInspectedCountMetricId,
  cqcRatingCountMetricId,
  numCqcRatingMetricId,
  percCqcRatingMetricId,
};
export type { CqcRatingId, CqcServiceTypeId };

/**
 * The colour each rating is drawn in, used wherever a rating is shown. The
 * table shows the same colour beside each rating so it can be read against
 * the chart.
 */
export const CQC_RATING_COLOURS: Record<CqcRatingId, string> = {
  outstanding: '#008B76',
  good: '#1D70B8',
  requires_improvement: '#F47738',
  inadequate: '#F499BE',
  insufficient_evidence: '#B1B4B6',
};

/** The ratings as the rows of the table and the segments of the chart */
export const CQC_RATING_CATEGORIES: ChartBreakdownCategory[] = (
  Object.keys(CQC_RATINGS) as CqcRatingId[]
).map((rating) => ({
  label: CQC_RATINGS[rating],
  colour: CQC_RATING_COLOURS[rating],
  countMetric: numCqcRatingMetricId(rating),
  percentageMetric: percCqcRatingMetricId(rating),
}));

/** The counts, which a comparison group's totals are summed from */
export const CQC_RATING_COUNT_METRIC_IDS: string[] = [
  ...CQC_RATING_CATEGORIES.map((category) => category.countMetric),
  NUM_CQC_INSPECTED_LOCATIONS,
];

/** Every metric the ratings are shown from */
export const CQC_RATING_METRIC_IDS: string[] = [
  ...CQC_RATING_COUNT_METRIC_IDS,
  ...CQC_RATING_CATEGORIES.map((category) => category.percentageMetric),
];

/** Inspected and not yet inspected, as the rows of the inspection status table */
export const CQC_INSPECTION_STATUS_CATEGORIES: BreakdownCategory[] = [
  {
    label: METRICS[PERC_CQC_INSPECTED_LOCATIONS].label,
    countMetric: NUM_CQC_INSPECTED_LOCATIONS,
    percentageMetric: PERC_CQC_INSPECTED_LOCATIONS,
  },
  {
    label: METRICS[NUM_CQC_UNINSPECTED_LOCATIONS].label,
    countMetric: NUM_CQC_UNINSPECTED_LOCATIONS,
    percentageMetric: PERC_CQC_UNINSPECTED_LOCATIONS,
  },
];

/** Every metric the inspection status is shown from */
export const CQC_INSPECTION_STATUS_METRIC_IDS: string[] = [
  ...CQC_INSPECTION_STATUS_CATEGORIES.flatMap((category) => [
    category.countMetric,
    category.percentageMetric,
  ]),
  NUM_CQC_LOCATIONS,
];

/**
 * The counts fetched for a comparison group on the CQC ratings page. The
 * inspected count is in both tables, so it is listed once.
 */
export const CQC_PAGE_COUNT_METRIC_IDS: string[] = [
  ...CQC_RATING_COUNT_METRIC_IDS,
  NUM_CQC_UNINSPECTED_LOCATIONS,
  NUM_CQC_LOCATIONS,
];

/** Every metric shown on the CQC ratings page */
export const CQC_PAGE_METRIC_IDS: string[] = [
  ...new Set([...CQC_RATING_METRIC_IDS, ...CQC_INSPECTION_STATUS_METRIC_IDS]),
];

/**
 * The ratings local authorities can be compared on, in the order offered.
 * "Insufficient evidence to rate" is left out: it is not a rating a location
 * can be benchmarked on.
 */
export const CQC_BENCHMARK_RATINGS: CqcRatingId[] = [
  'outstanding',
  'good',
  'requires_improvement',
  'inadequate',
];

export const DEFAULT_CQC_BENCHMARK_RATING: CqcRatingId = 'good';

/** The individual service types, without the "All service types" option */
export const CQC_SERVICE_TYPE_OPTIONS = (
  Object.keys(CQC_SERVICE_TYPES) as CqcServiceTypeId[]
)
  .filter((serviceType) => serviceType !== ALL_CQC_SERVICE_TYPES)
  .map((serviceType) => ({
    value: serviceType,
    label: CQC_SERVICE_TYPES[serviceType],
  }));

/**
 * The service type filter, wherever locations are filtered by it. Its id is
 * also the name of the locations list's query parameter.
 */
export const CQC_SERVICE_TYPE_FILTER_GROUP: FilterGroup = {
  id: 'service_types',
  label: 'Service type',
  allLabel: CQC_SERVICE_TYPES[ALL_CQC_SERVICE_TYPES],
  options: CQC_SERVICE_TYPE_OPTIONS,
};
