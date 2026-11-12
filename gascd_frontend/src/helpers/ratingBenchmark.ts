import { Indicator } from '@/data/interfaces/Indicator';
import { PeerGroupData } from '@/components/charts/peer-group/types';

/**
 * Derivations for benchmarking local authorities on the share of a whole that
 * falls in one category (the percentage of inspected locations with a chosen
 * CQC rating, say), where the category and the whole can each be the sum of
 * several metrics (one per service type chosen).
 *
 * The percentages are worked out from the counts rather than read from the
 * API's percentage metrics, as a percentage across several service types is
 * not the mean of each type's percentage.
 */

/** A count as a percentage of a total, or null where there is nothing to be a share of */
export const shareOfTotal = (
  count: number | null,
  total: number | null
): number | null => (count === null || !total ? null : (count / total) * 100);

/**
 * The sum of several metrics for one location type, or null where none of
 * them has a value
 */
export const sumForLocationType = (
  data: Indicator[],
  metricIds: string[],
  locationType: string
): number | null => {
  const values = data
    .filter(
      (item) =>
        metricIds.includes(item.metric_id) &&
        item.location_type === locationType &&
        item.data_point !== null
    )
    .map((item) => item.data_point as number);
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0)
    : null;
};

export type ShareBenchmark = {
  /**
   * Each comparison LA's percentage and the group's own, in the shape the
   * peer group chart and table take; null until every metric has arrived
   */
  peerData: PeerGroupData | null;
  /** The count behind each LA's percentage, by LA name */
  countsByName: Record<string, number>;
  /** The LAs with nothing to be a share of, which have no percentage */
  unavailableNames: string[];
};

/**
 * The comparison group's LAs with their share of the total, from the counts
 * fetched for each metric. An LA whose total is zero has no percentage (not
 * 0%). The group's percentage is its LAs' counts summed over their totals
 * summed, as a region's and England's are, leaving out the user's own LA.
 */
export const shareBenchmark = (
  dataByMetric: Record<string, PeerGroupData | null>,
  countMetricIds: string[],
  totalMetricIds: string[],
  ownLaCode?: string
): ShareBenchmark => {
  const metricIds = [...countMetricIds, ...totalMetricIds];
  const first = dataByMetric[metricIds[0]];
  if (!first || metricIds.some((metricId) => !dataByMetric[metricId])) {
    return { peerData: null, countsByName: {}, unavailableNames: [] };
  }

  const sumFor = (laCode: string, ids: string[]): number =>
    ids.reduce(
      (sum, metricId) =>
        sum +
        (dataByMetric[metricId]?.localAuthorityPeers.find(
          (peer) => peer.code === laCode
        )?.metricValue ?? 0),
      0
    );

  const countsByName: Record<string, number> = {};
  const unavailableNames: string[] = [];
  const localAuthorityPeers = first.localAuthorityPeers.map((peer) => {
    const count = sumFor(peer.code, countMetricIds);
    const metricValue = shareOfTotal(count, sumFor(peer.code, totalMetricIds));
    if (peer.code !== ownLaCode) {
      if (metricValue === null) unavailableNames.push(peer.displayName);
      else countsByName[peer.displayName] = count;
    }
    return { ...peer, metricValue };
  });

  const groupSum = (ids: string[]): number =>
    first.localAuthorityPeers
      .filter((peer) => peer.code !== ownLaCode)
      .reduce((sum, peer) => sum + sumFor(peer.code, ids), 0);

  return {
    peerData: {
      localAuthorityPeers,
      averagePeerGroup: shareOfTotal(
        groupSum(countMetricIds),
        groupSum(totalMetricIds)
      ),
      nationalAverage: null,
    },
    countsByName,
    unavailableNames,
  };
};
