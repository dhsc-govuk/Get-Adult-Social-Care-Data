import { describe, it, expect } from 'vitest';
import {
  mapCustomGroupResponse,
  mapPeerGroupResponse,
} from '@/components/charts/peer-group/MapPeerGroupResponse';

describe('mapPeerGroupResponse', () => {
  it('maps a full response', () => {
    const result = mapPeerGroupResponse({
      local_authority_peers: [
        {
          code: 'E08000015',
          display_name: 'Manchester',
          peer_ranking: 1,
          metric_value: 51.5,
        },
      ],
      average_peer_group: 51.5,
      national_average: 10.5,
    });

    expect(result).toEqual({
      localAuthorityPeers: [
        {
          code: 'E08000015',
          displayName: 'Manchester',
          peerRanking: 1,
          metricValue: 51.5,
        },
      ],
      averagePeerGroup: 51.5,
      nationalAverage: 10.5,
    });
  });

  it('defaults missing fields', () => {
    const result = mapPeerGroupResponse({});
    expect(result).toEqual({
      localAuthorityPeers: [],
      averagePeerGroup: null,
      nationalAverage: null,
    });
  });

  it('drops duplicate peer entries, keeping the first per LA code', () => {
    // e.g. a peers load that ran twice; duplicates desynchronise the chart's
    // highlight shape from Plotly's deduplicated category axis
    const result = mapPeerGroupResponse({
      local_authority_peers: [
        {
          code: 'E08000015',
          display_name: 'Manchester',
          peer_ranking: 1,
          metric_value: 51.5,
        },
        {
          code: 'E08000016',
          display_name: 'Leeds',
          peer_ranking: 2,
          metric_value: 48.2,
        },
        {
          code: 'E08000015',
          display_name: 'Manchester',
          peer_ranking: 16,
          metric_value: 51.5,
        },
      ],
      average_peer_group: 49.85,
      national_average: 10.5,
    });

    expect(result.localAuthorityPeers).toEqual([
      {
        code: 'E08000015',
        displayName: 'Manchester',
        peerRanking: 1,
        metricValue: 51.5,
      },
      {
        code: 'E08000016',
        displayName: 'Leeds',
        peerRanking: 2,
        metricValue: 48.2,
      },
    ]);
  });
});

describe('mapCustomGroupResponse', () => {
  it('maps a full response into the shared PeerGroupData shape', () => {
    const result = mapCustomGroupResponse({
      group_members: [
        { code: 'E08000018', display_name: 'Sheffield', metric_value: 55.5 },
        { code: 'E08000019', display_name: 'York', metric_value: null },
      ],
      custom_group_average: 55.5,
      national_average: 10.5,
    });

    expect(result).toEqual({
      localAuthorityPeers: [
        {
          code: 'E08000018',
          displayName: 'Sheffield',
          peerRanking: 1,
          metricValue: 55.5,
        },
        {
          code: 'E08000019',
          displayName: 'York',
          peerRanking: 2,
          metricValue: null,
        },
      ],
      averagePeerGroup: 55.5,
      nationalAverage: 10.5,
    });
  });

  it('defaults missing fields', () => {
    const result = mapCustomGroupResponse({});
    expect(result).toEqual({
      localAuthorityPeers: [],
      averagePeerGroup: null,
      nationalAverage: null,
    });
  });

  it('handles omitted average keys (nulls are not serialized by the API)', () => {
    const result = mapCustomGroupResponse({
      group_members: [{ code: 'E08000019', display_name: 'York' }],
    });
    expect(result.localAuthorityPeers[0].metricValue).toBeNull();
    expect(result.averagePeerGroup).toBeNull();
    expect(result.nationalAverage).toBeNull();
  });

  it('drops duplicate group members, keeping the first per LA code', () => {
    const result = mapCustomGroupResponse({
      group_members: [
        { code: 'E08000018', display_name: 'Sheffield', metric_value: 55.5 },
        { code: 'E08000019', display_name: 'York', metric_value: 12.1 },
        { code: 'E08000018', display_name: 'Sheffield', metric_value: 55.5 },
      ],
      custom_group_average: 33.8,
      national_average: 10.5,
    });

    expect(result.localAuthorityPeers.map((peer) => peer.code)).toEqual([
      'E08000018',
      'E08000019',
    ]);
  });
});
