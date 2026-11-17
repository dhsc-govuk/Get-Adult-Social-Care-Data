import { describe, it, expect } from 'vitest';
import {
  benchmarkFailed,
  shareBenchmark,
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

  it('gives the group no percentage where none of its LAs has a count, as the ratings breakdown does', () => {
    expect(
      shareBenchmark(
        {
          good_homes: peers({ A: null, B: null }),
          inspected_homes: peers({ A: 10, B: 4 }),
        },
        ['good_homes'],
        ['inspected_homes']
      ).peerData?.averagePeerGroup
    ).toBeNull();
  });

  it("works the NHS peer group's percentage out from its own LAs where the region is the comparison group", () => {
    const withNhsPeers = (
      values: Record<string, number | null>,
      nhsValues: Record<string, number | null>
    ) => ({
      ...peers(values),
      nhsPeerGroupPeers: peers(nhsValues).localAuthorityPeers,
    });
    const region = shareBenchmark(
      {
        good_homes: withNhsPeers({ A: 9 }, { X: 1, Y: 2, OWN: 9 }),
        inspected_homes: withNhsPeers({ A: 10 }, { X: 4, Y: 8, OWN: 10 }),
      },
      ['good_homes'],
      ['inspected_homes'],
      'OWN'
    );
    expect(region.peerData?.averagePeerGroup).toBe(90);
    expect(region.peerData?.nhsPeerGroupAverage).toBe(25);
    // Not set for any other comparison group
    expect(result.peerData).not.toHaveProperty('nhsPeerGroupAverage');
  });

  it("keeps the region's percentages, without the NHS peer group's, where its LAs failed to load for a metric", () => {
    const region = shareBenchmark(
      {
        good_homes: {
          ...peers({ A: 9 }),
          nhsPeerGroupPeers: peers({ X: 1 }).localAuthorityPeers,
        },
        inspected_homes: { ...peers({ A: 10 }), nhsPeerGroupPeers: null },
      },
      ['good_homes'],
      ['inspected_homes']
    );
    expect(region.peerData?.averagePeerGroup).toBe(90);
    expect(region.peerData?.nhsPeerGroupAverage).toBeNull();
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

describe('benchmarkFailed', () => {
  const loaded = peers({ A: 1 });

  it('is false while the metrics are loading or once they have all arrived', () => {
    expect(benchmarkFailed({}, ['count', 'inspected'])).toBe(false);
    expect(
      benchmarkFailed({ count: loaded, inspected: loaded }, [
        'count',
        'inspected',
      ])
    ).toBe(false);
  });

  it('is true where one metric failed', () => {
    expect(
      benchmarkFailed({ count: loaded, inspected: null }, [
        'count',
        'inspected',
      ])
    ).toBe(true);
  });

  it("is false where only the NHS peer group's LAs failed beside the region's", () => {
    expect(
      benchmarkFailed({ count: { ...loaded, nhsPeerGroupPeers: null } }, [
        'count',
      ])
    ).toBe(false);
  });
});
