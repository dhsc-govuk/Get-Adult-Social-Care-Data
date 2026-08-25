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
});
