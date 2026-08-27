import { PeerGroupApiResponse, PeerGroupData } from './types';

export const mapPeerGroupResponse = (
  raw: PeerGroupApiResponse,
  mkey: string
): PeerGroupData => ({
  localAuthorityPeers: (raw.local_authority_peers ?? []).map((peer, index) => ({
    code: peer.code ?? `peer-${index}`,
    displayName: peer.display_name ?? 'Unknown',
    peerRanking: peer.peer_ranking ?? index + 1,
    metricValue: peer.metric_value ?? null,
  })),
  averagePeerGroup: raw.average_peer_group ?? null,
  nationalAverage: raw.national_average ?? null,
  metric_id: mkey,
});
