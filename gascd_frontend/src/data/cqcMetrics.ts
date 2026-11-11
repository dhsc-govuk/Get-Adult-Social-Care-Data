/**
 * Metric ids and shared labelling for the CQC ratings of adult social care
 * locations.
 *
 * Held in one place because the same ids are needed by the data page, the
 * sharing categorisation and the tests. The ids themselves are declared once,
 * with their labels and formats, in `@/config/metrics`.
 */

import {
  CQC_RATINGS,
  CqcRatingId,
  NUM_CQC_INSPECTED_LOCATIONS,
  SOURCES,
  numCqcRatingMetricId,
  percCqcRatingMetricId,
} from '@/config/metrics';
import { BreakdownCategory } from '@/helpers/categoryBreakdown';

export {
  NUM_CQC_INSPECTED_LOCATIONS,
  numCqcRatingMetricId,
  percCqcRatingMetricId,
};

export const CQC_RATINGS_SOURCE = SOURCES.cqcRatings;

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
