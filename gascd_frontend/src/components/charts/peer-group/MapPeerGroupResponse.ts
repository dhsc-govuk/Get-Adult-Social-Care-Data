import {
  CustomGroupApiResponse,
  PeerGroupApiResponse,
  PeerGroupData,
} from './types';

export const mapPeerGroupResponse = (
  raw: PeerGroupApiResponse
): PeerGroupData => ({
  localAuthorityPeers: (raw.local_authority_peers ?? []).map((peer, index) => ({
    code: peer.code ?? `peer-${index}`,
    displayName: peer.display_name ?? 'Unknown',
    peerRanking: peer.peer_ranking ?? index + 1,
    metricValue: peer.metric_value ?? null,
  })),
  averagePeerGroup: raw.average_peer_group ?? null,
  nationalAverage: raw.national_average ?? null,
});

export const mapCustomGroupResponse = (
  raw: CustomGroupApiResponse
): PeerGroupData => ({
  localAuthorityPeers: (raw.group_members ?? []).map((member, index) => ({
    code: member.code ?? `member-${index}`,
    displayName: member.display_name ?? 'Unknown',
    peerRanking: index + 1,
    metricValue: member.metric_value ?? null,
  })),
  averagePeerGroup: raw.custom_group_average ?? null,
  nationalAverage: raw.national_average ?? null,
});
