/**
 * Metric ids and shared labelling for the CQC ratings of adult social care
 * locations.
 *
 * Held in one place because the same ids are needed by the data page, the
 * sharing categorisation and the tests. The ids follow the
 * `num_cqc_rating_<rating>` / `perc_cqc_rating_<rating>` convention, with the
 * count of rated locations as `num_cqc_rated_locations`.
 */

import { CQC_RATINGS, CqcRatingId, SOURCES } from '@/config/metrics';
import { BreakdownCategory } from '@/helpers/categoryBreakdown';

export const CQC_RATINGS_SOURCE = SOURCES.cqcRatings;

/** The number of locations with each rating */
export const numCqcRatingMetricId = (rating: CqcRatingId) =>
  `num_cqc_rating_${rating}` as const;

/** The percentage of rated locations with each rating */
export const percCqcRatingMetricId = (rating: CqcRatingId) =>
  `perc_cqc_rating_${rating}` as const;

/** All locations with a rating: the total the percentages are of */
export const NUM_CQC_RATED_LOCATIONS = 'num_cqc_rated_locations';

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
  NUM_CQC_RATED_LOCATIONS,
];

/** Every metric shown on the CQC ratings page */
export const CQC_RATING_METRIC_IDS: string[] = [
  ...CQC_RATING_COUNT_METRIC_IDS,
  ...CQC_RATING_CATEGORIES.map((category) => category.percentageMetric),
];
