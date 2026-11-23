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
  MetricId,
  NUM_CQC_INSPECTED_LOCATIONS,
  NUM_CQC_LOCATIONS,
  NUM_CQC_UNINSPECTED_LOCATIONS,
  PERC_CQC_INSPECTED_LOCATIONS,
  PERC_CQC_UNINSPECTED_LOCATIONS,
  cqcInspectedCountMetricId,
  cqcLocationCountMetricId,
  cqcRatingCountMetricId,
  cqcUninspectedCountMetricId,
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
    label: METRICS[PERC_CQC_UNINSPECTED_LOCATIONS].label,
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
  ...new Set([
    ...CQC_RATING_COUNT_METRIC_IDS,
    ...CQC_INSPECTION_STATUS_CATEGORIES.map((category) => category.countMetric),
    NUM_CQC_LOCATIONS,
  ]),
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

const forServiceTypes = (selectedServiceTypesOnly: boolean) =>
  selectedServiceTypesOnly ? ' for the selected service types' : '';

/**
 * Why an LA shows 0 not yet inspected, so that it is not read as missing data
 */
export const allLocationsInspectedNote = (
  laName: string,
  selectedServiceTypesOnly = false
): string =>
  `${laName} shows 0 not yet inspected because all of its adult social care locations${forServiceTypes(selectedServiceTypesOnly)} have been inspected.`;

/**
 * Why an LA has no CQC ratings, and where its locations are counted instead
 */
export const noInspectedLocationsNote = (
  laName: string,
  selectedServiceTypesOnly = false
): string =>
  `${laName} has no inspected adult social care locations${forServiceTypes(selectedServiceTypesOnly)}. See Table 3 for the number and percentage inspected and not yet inspected.`;

/**
 * What local authorities are benchmarked on in a "by local authority" section
 * of the CQC ratings page: the percentage of a total (the inspected locations,
 * say) that falls in the option chosen (a rating).
 */
export type CqcBenchmark = {
  sectionTitle: string;
  helpUrl: string;
  // Follows "Find out", e.g. "how ... are calculated"
  helpLinkText: string;
  // The label of the select the options are chosen from
  selectLabel: string;
  options: {
    value: string;
    label: string;
    countMetricId: (serviceType: CqcServiceTypeId) => string;
    // For all service types: sets the format, the source and the sharing label
    percentageMetric: MetricId;
    // What the table and the figure show, e.g. "percentage of ... rated Good"
    title: string;
    // The heading of the table's value column
    valueHeader: string;
    // Shown below the table and the chart where the user's LA has 0
    zeroNote?: (laName: string, selectedServiceTypesOnly: boolean) => string;
  }[];
  defaultValue: string;
  totalMetricId: (serviceType: CqcServiceTypeId) => string;
  // What the percentages are of, e.g. "inspected locations". An LA with none
  // has no percentage
  totalDescription: string;
  // Shown below the table and the chart where the user's LA has none
  noTotalNote?: (laName: string, selectedServiceTypesOnly: boolean) => string;
  // The name the service type filter is tracked under
  analyticsId: string;
};

export const CQC_RATING_BENCHMARK: CqcBenchmark = {
  sectionTitle:
    'CQC ratings of inspected adult social care locations by local authority',
  helpUrl: METRICS[NUM_CQC_INSPECTED_LOCATIONS].helpUrl,
  helpLinkText:
    'how the number and percentage of inspected adult social care locations by CQC rating are calculated',
  selectLabel: 'CQC rating',
  options: CQC_BENCHMARK_RATINGS.map((rating) => ({
    value: rating,
    label: CQC_RATINGS[rating],
    countMetricId: (serviceType) => cqcRatingCountMetricId(rating, serviceType),
    percentageMetric: percCqcRatingMetricId(rating),
    title: `percentage of inspected adult social care locations rated ${CQC_RATINGS[rating]}`,
    valueHeader: `Percentage rated ${CQC_RATINGS[rating].toLowerCase()}`,
  })),
  defaultValue: DEFAULT_CQC_BENCHMARK_RATING,
  totalMetricId: cqcInspectedCountMetricId,
  totalDescription: 'inspected locations',
  noTotalNote: noInspectedLocationsNote,
  analyticsId: 'cqc-ratings-service-type',
};

const inspectionStatusOption = (
  percentageMetric: MetricId,
  countMetricId: (serviceType: CqcServiceTypeId) => string,
  zeroNote?: CqcBenchmark['options'][number]['zeroNote']
): CqcBenchmark['options'][number] => {
  const { label } = METRICS[percentageMetric];
  return {
    value: percentageMetric,
    label,
    countMetricId,
    percentageMetric,
    title: `percentage of adult social care locations ${label.toLowerCase()}`,
    valueHeader: `Percentage ${label.toLowerCase()}`,
    zeroNote,
  };
};

export const CQC_INSPECTION_STATUS_BENCHMARK: CqcBenchmark = {
  sectionTitle:
    'Inspection status of adult social care locations by local authority',
  helpUrl: METRICS[NUM_CQC_LOCATIONS].helpUrl,
  helpLinkText:
    'how the inspection status of adult social care locations is calculated',
  selectLabel: 'Inspection status',
  options: [
    inspectionStatusOption(
      PERC_CQC_INSPECTED_LOCATIONS,
      cqcInspectedCountMetricId
    ),
    inspectionStatusOption(
      PERC_CQC_UNINSPECTED_LOCATIONS,
      cqcUninspectedCountMetricId,
      allLocationsInspectedNote
    ),
  ],
  defaultValue: PERC_CQC_UNINSPECTED_LOCATIONS,
  totalMetricId: cqcLocationCountMetricId,
  totalDescription: 'locations',
  analyticsId: 'cqc-inspection-status-service-type',
};

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
