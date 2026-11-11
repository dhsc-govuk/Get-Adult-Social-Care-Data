import { describe, it, expect } from 'vitest';
import {
  BreakdownCategory,
  breakdownBars,
  breakdownValue,
  mergeComparatorTotals,
} from '@/helpers/categoryBreakdown';
import { COMPARATOR_AVERAGE_LOCATION_TYPE } from '@/components/charts/peer-group/constants';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import { Indicator } from '@/data/interfaces/Indicator';

const GOOD = 'cqcr_num_good_adult_social_care';
const PERC_GOOD = 'cqcr_pct_inspected_good_adult_social_care';
const INADEQUATE = 'cqcr_num_inadequate_adult_social_care';
const PERC_INADEQUATE = 'cqcr_pct_inspected_inadequate_adult_social_care';
const TOTAL = 'cqci_num_inspected_adult_social_care';

const categories: BreakdownCategory[] = [
  {
    label: 'Good',
    colour: '#1d70b8',
    countMetric: GOOD,
    percentageMetric: PERC_GOOD,
  },
  {
    label: 'Inadequate',
    colour: '#d53880',
    countMetric: INADEQUATE,
    percentageMetric: PERC_INADEQUATE,
  },
];

const indicator = (
  metric_id: string,
  location_type: string,
  data_point: number | null
) =>
  ({
    metric_id,
    location_type,
    location_id: location_type,
    metric_date: '2024-04-01',
    data_point,
  }) as Indicator;

const data: Indicator[] = [
  indicator(GOOD, 'LA', 60),
  indicator(GOOD, 'Regional', 600),
  indicator(GOOD, 'National', 6000),
  indicator(INADEQUATE, 'LA', 40),
  indicator(INADEQUATE, 'Regional', 400),
  indicator(INADEQUATE, 'National', 4000),
  indicator(TOTAL, 'LA', 100),
  indicator(TOTAL, 'Regional', 1000),
  indicator(TOTAL, 'National', 10000),
  indicator(PERC_GOOD, 'LA', 60),
  indicator(PERC_GOOD, 'Regional', 60),
  indicator(PERC_GOOD, 'National', 60),
  indicator(PERC_INADEQUATE, 'LA', 40),
  indicator(PERC_INADEQUATE, 'Regional', 40),
  indicator(PERC_INADEQUATE, 'National', 40),
];

const peerGroup = (
  values: { code: string; value: number | null }[]
): PeerGroupData => ({
  localAuthorityPeers: values.map(({ code, value }, index) => ({
    code,
    displayName: `Peer ${code}`,
    peerRanking: index + 1,
    metricValue: value,
  })),
  averagePeerGroup: null,
  nationalAverage: null,
});

const comparatorValue = (merged: Indicator[], metricId: string) =>
  breakdownValue(merged, metricId, COMPARATOR_AVERAGE_LOCATION_TYPE);

describe('mergeComparatorTotals', () => {
  it("sums the comparison group's counts and derives its percentages", () => {
    const merged = mergeComparatorTotals(
      data,
      categories,
      TOTAL,
      {
        [GOOD]: peerGroup([
          { code: 'a', value: 10 },
          { code: 'b', value: 20 },
        ]),
        [INADEQUATE]: peerGroup([
          { code: 'a', value: 5 },
          { code: 'b', value: 15 },
        ]),
        [TOTAL]: peerGroup([
          { code: 'a', value: 15 },
          { code: 'b', value: 35 },
        ]),
      },
      'E12000001',
      false,
      'own'
    );

    expect(comparatorValue(merged, GOOD)).toBe(30);
    expect(comparatorValue(merged, INADEQUATE)).toBe(20);
    expect(comparatorValue(merged, TOTAL)).toBe(50);
    expect(comparatorValue(merged, PERC_GOOD)).toBe(60);
    expect(comparatorValue(merged, PERC_INADEQUATE)).toBe(40);
  });

  it("leaves the user's own LA and members without data out of the sum", () => {
    const merged = mergeComparatorTotals(
      data,
      categories,
      TOTAL,
      {
        [GOOD]: peerGroup([
          { code: 'own', value: 60 },
          { code: 'a', value: 10 },
          { code: 'b', value: null },
        ]),
        [TOTAL]: peerGroup([
          { code: 'own', value: 100 },
          { code: 'a', value: 40 },
        ]),
      },
      'E12000001',
      false,
      'own'
    );

    expect(comparatorValue(merged, GOOD)).toBe(10);
    expect(comparatorValue(merged, TOTAL)).toBe(40);
    expect(comparatorValue(merged, PERC_GOOD)).toBe(25);
  });

  it('uses the published regional rows when the region is the comparator', () => {
    const merged = mergeComparatorTotals(
      data,
      categories,
      TOTAL,
      {},
      'E12000001',
      true,
      'own'
    );

    expect(comparatorValue(merged, GOOD)).toBe(600);
    expect(comparatorValue(merged, TOTAL)).toBe(1000);
    expect(comparatorValue(merged, PERC_GOOD)).toBe(60);
  });

  it('leaves the comparator unavailable while its data is unresolved', () => {
    const merged = mergeComparatorTotals(
      data,
      categories,
      TOTAL,
      {},
      'E12000001',
      false,
      'own'
    );

    expect(comparatorValue(merged, GOOD)).toBeNull();
    expect(comparatorValue(merged, TOTAL)).toBeNull();
    expect(comparatorValue(merged, PERC_GOOD)).toBeNull();
  });

  it('keeps the LA, regional and national rows as they were', () => {
    const merged = mergeComparatorTotals(
      data,
      categories,
      TOTAL,
      {},
      'E12000001',
      false,
      'own'
    );

    expect(breakdownValue(merged, GOOD, 'LA')).toBe(60);
    expect(breakdownValue(merged, GOOD, 'Regional')).toBe(600);
    expect(breakdownValue(merged, PERC_GOOD, 'National')).toBe(60);
  });
});

describe('breakdownBars', () => {
  it('gives one segment per category across the bars, with the counts for hover', () => {
    const chart = breakdownBars(data, categories, [
      { label: 'Sunderland', locationType: 'LA' },
      { label: 'England (national)', locationType: 'National' },
    ]);

    expect(chart.categories).toEqual(['Sunderland', 'England (national)']);
    expect(chart.segments).toEqual([
      {
        name: 'Good',
        color: '#1d70b8',
        values: [60, 60],
        counts: [60, 6000],
      },
      {
        name: 'Inadequate',
        color: '#d53880',
        values: [40, 40],
        counts: [40, 4000],
      },
    ]);
  });

  it('shows a missing bar as null rather than skipping it', () => {
    const chart = breakdownBars(data, categories, [
      { label: 'Sunderland', locationType: 'LA' },
      { label: 'NHS peer group total', locationType: 'ComparatorAverage' },
    ]);

    expect(chart.segments[0].values).toEqual([60, null]);
    expect(chart.segments[0].counts).toEqual([60, null]);
  });
});
