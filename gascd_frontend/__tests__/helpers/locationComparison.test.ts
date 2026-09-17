import { describe, it, expect } from 'vitest';
import {
  comparisonLabels,
  locationBarSeries,
  locationTimeSeries,
  PEER_GROUP_AVERAGE_LABEL,
  peerRowsForLatestPeriod,
} from '@/helpers/locationComparison';
import { PEER_GROUP_LOCATION_TYPE } from '@/constants';
import { Indicator } from '@/data/interfaces/Indicator';
import { LocationNames } from '@/data/interfaces/LocationNames';

const indicator = (
  metric_id: string,
  location_type: string,
  metric_date: string,
  data_point: number
): Indicator =>
  ({
    metric_id,
    location_type,
    location_id: location_type,
    metric_date,
    metric_date_type: 'Yearly',
    data_point,
  }) as Indicator;

const labels = comparisonLabels({
  CPLabel: 'N/A',
  LALabel: 'Test LA 1',
  RegionLabel: 'Test Region 1',
  CountryLabel: 'Test Nation',
} as LocationNames);

const withoutPeers: Indicator[] = [
  indicator('num_children_in_need', 'LA', '2024', 100),
  indicator('num_children_in_need', 'LA', '2025', 120),
  indicator('num_children_in_need', 'Regional', '2024', 80),
  indicator('num_children_in_need', 'National', '2024', 90),
];

const withPeers: Indicator[] = [
  ...withoutPeers,
  indicator('num_children_in_need', PEER_GROUP_LOCATION_TYPE, '2024', 85),
  indicator('num_children_in_need', PEER_GROUP_LOCATION_TYPE, '2025', 95),
];

describe('locationTimeSeries', () => {
  it('returns the LA solid and the regional and national series as comparators', () => {
    const series = locationTimeSeries(
      withoutPeers,
      'num_children_in_need',
      labels
    );

    expect(series.map((s) => s.name)).toEqual([
      'Test LA 1',
      'Test Region 1 (regional average)',
      'Test Nation (national average)',
    ]);
    expect(series.map((s) => !!s.comparator)).toEqual([false, true, true]);
    expect(series[0].data.map((d) => d.value)).toEqual([100, 120]);
  });

  it('appends the peer group average as a comparator when the data has one', () => {
    const series = locationTimeSeries(
      withPeers,
      'num_children_in_need',
      labels
    );

    expect(series).toHaveLength(4);
    const peers = series[3];
    expect(peers.name).toBe(PEER_GROUP_AVERAGE_LABEL);
    expect(peers.comparator).toBe(true);
    expect(peers.color).toBeDefined();
    expect(peers.data.map((d) => d.value)).toEqual([85, 95]);
  });

  it('does not add a peer group series for a metric the peer data does not cover', () => {
    const series = locationTimeSeries(
      withPeers,
      'cin_per_10000_children',
      labels
    );

    expect(series).toHaveLength(3);
  });
});

describe('locationBarSeries', () => {
  const byAge: Indicator[] = [
    indicator('num_ehcp_age_14', 'LA', '2025', 10),
    indicator('num_ehcp_age_15', 'LA', '2025', 12),
    indicator('num_ehcp_age_14', 'Regional', '2025', 8),
    indicator('num_ehcp_age_14', 'National', '2025', 9),
    indicator('num_ehcp_age_14', PEER_GROUP_LOCATION_TYPE, '2025', 7),
  ];

  it('gives one value per metric in order, null where a location has none', () => {
    const series = locationBarSeries(
      byAge,
      ['num_ehcp_age_14', 'num_ehcp_age_15'],
      labels
    );

    expect(series.map((s) => s.name)).toEqual([
      'Test LA 1',
      'Test Region 1 (regional average)',
      'Test Nation (national average)',
      PEER_GROUP_AVERAGE_LABEL,
    ]);
    expect(series[0].values).toEqual([10, 12]);
    expect(series[1].values).toEqual([8, null]);
    expect(series[3].values).toEqual([7, null]);
    expect(series[3].comparator).toBe(true);
  });
});

describe('peerRowsForLatestPeriod', () => {
  const shown: Indicator[] = [
    indicator('num_ehcp_age_14', 'LA', '2025', 10),
    indicator('num_ehcp_age_14', 'Regional', '2025', 8),
    indicator('num_ehcp_age_15', 'LA', '2024', 12),
  ];

  it('keeps, per metric, the peer row dated the same as the main data', () => {
    const peers: Indicator[] = [
      indicator('num_ehcp_age_14', PEER_GROUP_LOCATION_TYPE, '2024', 6),
      indicator('num_ehcp_age_14', PEER_GROUP_LOCATION_TYPE, '2025', 7),
      indicator('num_ehcp_age_15', PEER_GROUP_LOCATION_TYPE, '2024', 11),
      indicator('num_ehcp_age_15', PEER_GROUP_LOCATION_TYPE, '2025', 13),
    ];

    const rows = peerRowsForLatestPeriod(peers, shown);

    expect(rows.map((r) => [r.metric_id, r.metric_date, r.data_point])).toEqual(
      [
        ['num_ehcp_age_14', '2025', 7],
        ['num_ehcp_age_15', '2024', 11],
      ]
    );
  });

  it('drops a peer series that is behind the period shown, leaving a gap', () => {
    const stalePeers: Indicator[] = [
      indicator('num_ehcp_age_14', PEER_GROUP_LOCATION_TYPE, '2024', 6),
    ];

    const rows = peerRowsForLatestPeriod(stalePeers, shown);
    expect(rows).toEqual([]);

    const series = locationBarSeries(
      [...shown, ...rows],
      ['num_ehcp_age_14'],
      labels
    );
    // No peer series at all, rather than a 2024 figure under a 2025 heading
    expect(series.map((s) => s.name)).not.toContain(PEER_GROUP_AVERAGE_LABEL);
  });

  it('ignores peer rows for metrics the main data does not show', () => {
    const peers: Indicator[] = [
      indicator('num_ehcp_age_25', PEER_GROUP_LOCATION_TYPE, '2025', 3),
    ];

    expect(peerRowsForLatestPeriod(peers, shown)).toEqual([]);
  });
});
