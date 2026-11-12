import { describe, it, expect } from 'vitest';
import {
  shareBenchmark,
  shareOfTotal,
  sumForLocationType,
} from '@/helpers/ratingBenchmark';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import { Indicator } from '@/data/interfaces/Indicator';

const indicator = (
  metric_id: string,
  location_type: string,
  data_point: number | null
) => ({ metric_id, location_type, data_point }) as Indicator;

const peers = (values: Record<string, number | null>): PeerGroupData => ({
  localAuthorityPeers: Object.entries(values).map(([code, metricValue], i) => ({
    code,
    displayName: `LA ${code}`,
    peerRanking: i + 1,
    metricValue,
  })),
  averagePeerGroup: null,
  nationalAverage: null,
});

describe('shareOfTotal', () => {
  it('gives the count as a percentage of the total', () => {
    expect(shareOfTotal(25, 200)).toBe(12.5);
  });

  it('has no percentage where there is nothing to be a share of', () => {
    expect(shareOfTotal(0, 0)).toBeNull();
    expect(shareOfTotal(5, null)).toBeNull();
    expect(shareOfTotal(null, 10)).toBeNull();
  });

  it('is 0% where the total has none of the count', () => {
    expect(shareOfTotal(0, 10)).toBe(0);
  });
});

describe('sumForLocationType', () => {
  const data = [
    indicator('count_a', 'LA', 3),
    indicator('count_b', 'LA', 4),
    indicator('count_a', 'National', 100),
    indicator('other', 'LA', 50),
    indicator('count_c', 'LA', null),
  ];

  it('sums the chosen metrics for the location type', () => {
    expect(sumForLocationType(data, ['count_a', 'count_b'], 'LA')).toBe(7);
    expect(sumForLocationType(data, ['count_a', 'count_b'], 'National')).toBe(
      100
    );
  });

  it('is null where none of the metrics has a value', () => {
    expect(sumForLocationType(data, ['count_a'], 'Regional')).toBeNull();
    expect(sumForLocationType(data, ['count_c'], 'LA')).toBeNull();
  });
});

describe('shareBenchmark', () => {
  const dataByMetric = {
    good_homes: peers({ A: 9, B: 3, C: 0, OWN: 9 }),
    good_agencies: peers({ A: 1, B: null, C: 0, OWN: 1 }),
    inspected_homes: peers({ A: 10, B: 4, C: 0, OWN: 10 }),
    inspected_agencies: peers({ A: 30, B: null, C: 0, OWN: 10 }),
  };
  const result = shareBenchmark(
    dataByMetric,
    ['good_homes', 'good_agencies'],
    ['inspected_homes', 'inspected_agencies'],
    'OWN'
  );
  const valueOf = (code: string) =>
    result.peerData?.localAuthorityPeers.find((peer) => peer.code === code)
      ?.metricValue;

  it("works each LA's percentage out from the counts summed across the metrics", () => {
    // 9 + 1 of 10 + 30: the mean of the two percentages would be about 46.7%
    expect(valueOf('A')).toBe(25);
    // A metric with no value for an LA adds nothing to either sum
    expect(valueOf('B')).toBe(75);
  });

  it('gives an LA with nothing inspected no percentage, rather than 0%', () => {
    expect(valueOf('C')).toBeNull();
    expect(result.unavailableNames).toEqual(['LA C']);
  });

  it("works the group's percentage out from its LAs' counts summed, leaving out the user's own LA", () => {
    // A's 10 of 40 and B's 3 of 4 (C has none and OWN is the user's LA): the
    // mean of their percentages would be 50%
    expect(result.peerData?.averagePeerGroup).toBeCloseTo((13 / 44) * 100);
  });

  it('keeps the count behind each comparison LA percentage', () => {
    expect(result.countsByName).toEqual({ 'LA A': 10, 'LA B': 3 });
  });

  it('has no data until every metric has arrived', () => {
    expect(
      shareBenchmark(
        { ...dataByMetric, inspected_agencies: null },
        ['good_homes', 'good_agencies'],
        ['inspected_homes', 'inspected_agencies']
      ).peerData
    ).toBeNull();
    expect(
      shareBenchmark({}, ['good_homes'], ['inspected_homes']).peerData
    ).toBeNull();
  });
});
