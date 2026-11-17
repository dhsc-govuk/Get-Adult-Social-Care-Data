import { Indicator } from '@/data/interfaces/Indicator';
import {
  LocalAuthorityPeer,
  PeerGroupData,
} from '@/components/charts/peer-group/types';
import { peerGroupTotal, shareOfTotal } from '@/helpers/categoryBreakdown';

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
 * True where a metric's request has failed. The benchmark cannot be worked
 * out without every one of them.
 */
export const benchmarkFailed = (
  dataByMetric: Record<string, PeerGroupData | null>,
  metricIds: string[]
): boolean => metricIds.some((metricId) => dataByMetric[metricId] === null);

/**
 * True where the NHS peer group's LAs, fetched beside the region's, failed to
 * load for a metric. The rest of the benchmark stands, without the NHS peer
 * group's percentage, as on the other peer group charts.
 */
const nhsPeerGroupFailed = (
  dataByMetric: Record<string, PeerGroupData | null>,
  metricIds: string[]
): boolean =>
  metricIds.some(
    (metricId) => dataByMetric[metricId]?.nhsPeerGroupPeers === null
  );

/**
 * The comparison group's LAs with their share of the total, from the counts
 * fetched for each metric. An LA whose total is zero has no percentage (not
 * 0%). The group's percentage is its LAs' counts summed over their totals
 * summed, as a region's and England's are, leaving out the user's own LA.
 * Where the region is the comparison group, the NHS peer group's percentage
 * is worked out the same way from its own LAs.
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

  // Each metric's total is summed as the ratings breakdown sums it
  // (`peerGroupTotal`), so the two figures cannot disagree
  const groupShare = (
    peersOf: (data: PeerGroupData) => LocalAuthorityPeer[] | null | undefined
  ): number | null => {
    const groupTotal = (ids: string[]): number | null => {
      const totals = ids
        .map((metricId) =>
          peerGroupTotal(peersOf(dataByMetric[metricId]!), ownLaCode)
        )
        .filter((total): total is number => total !== null);
      return totals.length > 0
        ? totals.reduce((sum, total) => sum + total, 0)
        : null;
    };
    return shareOfTotal(groupTotal(countMetricIds), groupTotal(totalMetricIds));
  };

  return {
    peerData: {
      localAuthorityPeers,
      averagePeerGroup: groupShare((data) => data.localAuthorityPeers),
      nationalAverage: null,
      // A percentage from only some of the metrics would be wrong, so there
      // is none where any of them is missing its NHS peer group
      ...(first.nhsPeerGroupPeers !== undefined && {
        nhsPeerGroupAverage: nhsPeerGroupFailed(dataByMetric, metricIds)
          ? null
          : groupShare((data) => data.nhsPeerGroupPeers),
      }),
    },
    countsByName,
    unavailableNames,
  };
};
