import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { Indicator } from '@/data/interfaces/Indicator';
import { PeerGroupData } from '@/components/charts/peer-group/types';

const row = (
  metric_id: string,
  location_type: string,
  data_point: number | null
): Indicator => ({
  metric_id,
  metric_date_type: 'Monthly',
  metric_date: '2021-03-01',
  location_type,
  location_id: `${location_type}-id`,
  numerator: 1,
  multiplier: 100,
  denominator: 2,
  data_point,
  load_date_time: new Date('2021-03-01'),
});

const peerData = (average: number | null): PeerGroupData => ({
  localAuthorityPeers: [],
  averagePeerGroup: average,
  nationalAverage: 10,
});

describe('mergeComparatorAverage', () => {
  it('overwrites an existing Regional row with the comparator average', () => {
    const result = mergeComparatorAverage(
      [row('m1', 'LA', 5), row('m1', 'Regional', 99), row('m1', 'National', 7)],
      ['m1'],
      { m1: peerData(12.5) },
      'E12000001'
    );

    const regional = result.filter((d) => d.location_type === 'Regional');
    expect(regional).toHaveLength(1);
    expect(regional[0].data_point).toBe(12.5);
    expect(regional[0].location_id).toBe('Regional-id');
  });

  it('synthesises a Regional row when the metrics API returned none', () => {
    const result = mergeComparatorAverage(
      [row('m1', 'LA', 5), row('m1', 'National', 7)],
      ['m1'],
      { m1: peerData(12.5) },
      'E12000001'
    );

    const regional = result.find(
      (d) => d.metric_id === 'm1' && d.location_type === 'Regional'
    );
    expect(regional).toBeDefined();
    expect(regional?.data_point).toBe(12.5);
    expect(regional?.location_id).toBe('E12000001');
    expect(regional?.metric_date).toBe('2021-03-01');
    // Other rows are untouched
    expect(result.filter((d) => d.location_type === 'LA')).toHaveLength(1);
    expect(result.filter((d) => d.location_type === 'National')).toHaveLength(
      1
    );
  });

  it('gives a null data point while comparator data is unresolved', () => {
    const result = mergeComparatorAverage(
      [row('m1', 'LA', 5), row('m1', 'National', 7)],
      ['m1'],
      {},
      'E12000001'
    );

    expect(
      result.find((d) => d.location_type === 'Regional')?.data_point
    ).toBeNull();
  });

  it('does not synthesise a row for a metric with no data at all', () => {
    const result = mergeComparatorAverage([row('m1', 'LA', 5)], ['m1', 'm2'], {
      m1: peerData(1),
      m2: peerData(2),
    });

    expect(result.some((d) => d.metric_id === 'm2')).toBe(false);
    expect(
      result.find((d) => d.metric_id === 'm1' && d.location_type === 'Regional')
        ?.location_id
    ).toBe('comparator-average');
  });

  it('handles several metrics independently', () => {
    const result = mergeComparatorAverage(
      [
        row('m1', 'LA', 5),
        row('m1', 'Regional', 50),
        row('m2', 'LA', 6),
        row('m2', 'National', 8),
      ],
      ['m1', 'm2'],
      { m1: peerData(1.5), m2: peerData(2.5) }
    );

    const regional = (id: string) =>
      result.find((d) => d.metric_id === id && d.location_type === 'Regional');
    expect(regional('m1')?.data_point).toBe(1.5);
    expect(regional('m2')?.data_point).toBe(2.5);
    expect(result.filter((d) => d.location_type === 'Regional')).toHaveLength(
      2
    );
  });
});
