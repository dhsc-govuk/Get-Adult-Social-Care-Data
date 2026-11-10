/**
 * Metric ids and shared labelling for the CQC ratings of adult social care
 * locations.
 *
 * Held in one place because the same ids are needed by the data page, the
 * sharing categorisation and the tests. The ids are the API's, from its
 * `cqc_ratings` and `cqc_inspection_status` groups, for all service types:
 * `cqcr_num_<rating>_adult_social_care` and
 * `cqcr_pct_inspected_<rating>_adult_social_care`, with the count of
 * inspected locations as `cqci_num_inspected_adult_social_care`.
 */

import { CQC_RATINGS, CqcRatingId, SOURCES } from '@/config/metrics';
import { BreakdownCategory } from '@/helpers/categoryBreakdown';

export const CQC_RATINGS_SOURCE = SOURCES.cqcRatings;

/** The number of locations with each rating */
export const numCqcRatingMetricId = (rating: CqcRatingId) =>
  `cqcr_num_${rating}_adult_social_care` as const;

/** The percentage of inspected locations with each rating */
export const percCqcRatingMetricId = (rating: CqcRatingId) =>
  `cqcr_pct_inspected_${rating}_adult_social_care` as const;

/** All inspected locations: the total the percentages are of */
export const NUM_CQC_INSPECTED_LOCATIONS =
  'cqci_num_inspected_adult_social_care';

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
export const CQC_RATING_CATEGORIES: BreakdownCategory[] = (
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

/** Every metric shown on the CQC ratings page */
export const CQC_RATING_METRIC_IDS: string[] = [
  ...CQC_RATING_COUNT_METRIC_IDS,
  ...CQC_RATING_CATEGORIES.map((category) => category.percentageMetric),
];
