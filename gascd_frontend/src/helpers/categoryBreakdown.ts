import { Indicator } from '@/data/interfaces/Indicator';
import { MetricId } from '@/config/metrics';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import { COMPARATOR_AVERAGE_LOCATION_TYPE } from '@/components/charts/peer-group/constants';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { StackedBarSegment } from '@/components/charts/StackedBarChart';

/**
 * Shared derivations for a metric broken down into categories, where each
 * category has a count and a percentage of the total (the CQC ratings of
 * locations, say). `CategoryBreakdownTable` and `StackedBarChart` each want the
 * same figures in a different shape, so the reshaping lives here.
 */

/** A row of the table and a segment of the chart */
export type BreakdownCategory = {
  label: string;
  /** The segment colour, also shown as a key beside the table row */
  colour: string;
  countMetric: MetricId;
  percentageMetric: MetricId;
};

/** A bar of the chart: a location type and how it is labelled */
export type BreakdownBar = {
  label: string;
  locationType: string;
};

/** A metric's value for a location type, or null where there is none */
export const breakdownValue = (
  data: Indicator[],
  metricId: string,
  locationType: string
): number | null =>
  data.find(
    (item) => item.metric_id === metricId && item.location_type === locationType
  )?.data_point ?? null;

/**
 * The comparison group's count: its members' values summed. The user's own LA
 * is excluded, as it is everywhere else the peer rows are used.
 */
const peerGroupTotal = (
  peerData: PeerGroupData | null | undefined,
  ownLaCode?: string
): number | null => {
  const peers =
    peerData?.localAuthorityPeers.filter(
      (peer) => peer.code !== ownLaCode && peer.metricValue !== null
    ) ?? [];
  return peers.length > 0
    ? peers.reduce((sum, peer) => sum + (peer.metricValue as number), 0)
    : null;
};

/**
 * Adds the comparison group's rows to the metric data, as
 * `mergeComparatorAverage` does, but with the counts summed across the group
 * and the percentages derived from those sums. A mean of the members'
 * percentages would weight a small LA the same as a large one; summing the
 * counts gives the share across the whole group, which is what reads naturally
 * beside England's figures.
 *
 * When the region is the comparator its published Regional rows are used,
 * which already cover the whole region.
 */
export const mergeComparatorTotals = (
  data: Indicator[],
  categories: BreakdownCategory[],
  totalMetric: MetricId,
  dataByMetric: Record<string, PeerGroupData | null>,
  regionLocationId: string | undefined,
  comparatorIsRegion: boolean,
  ownLaCode?: string
): Indicator[] => {
  const countMetrics = [
    ...categories.map((category) => category.countMetric),
    totalMetric,
  ];
  const metricIds = [
    ...countMetrics,
    ...categories.map((category) => category.percentageMetric),
  ];
  const merged = mergeComparatorAverage(
    data,
    metricIds,
    dataByMetric,
    regionLocationId,
    comparatorIsRegion
  );
  if (comparatorIsRegion) return merged;

  const totals = Object.fromEntries(
    countMetrics.map((metricId) => [
      metricId,
      peerGroupTotal(dataByMetric[metricId], ownLaCode),
    ])
  );
  const groupTotal = totals[totalMetric];

  return merged.map((item) => {
    if (item.location_type !== COMPARATOR_AVERAGE_LOCATION_TYPE) return item;
    if (item.metric_id in totals) {
      return { ...item, data_point: totals[item.metric_id] };
    }
    const category = categories.find(
      (candidate) => candidate.percentageMetric === item.metric_id
    );
    if (!category) return item;
    const count = totals[category.countMetric];
    return {
      ...item,
      data_point:
        count !== null && groupTotal ? (count / groupTotal) * 100 : null,
    };
  });
};

/**
 * One segment per category across the bars, ready for `StackedBarChart`: the
 * percentages set each segment's length and the counts are shown on hover.
 */
export const breakdownBars = (
  data: Indicator[],
  categories: BreakdownCategory[],
  bars: BreakdownBar[]
): { categories: string[]; segments: StackedBarSegment[] } => ({
  categories: bars.map((bar) => bar.label),
  segments: categories.map((category) => ({
    name: category.label,
    color: category.colour,
    values: bars.map((bar) =>
      breakdownValue(data, category.percentageMetric, bar.locationType)
    ),
    counts: bars.map((bar) =>
      breakdownValue(data, category.countMetric, bar.locationType)
    ),
  })),
});
