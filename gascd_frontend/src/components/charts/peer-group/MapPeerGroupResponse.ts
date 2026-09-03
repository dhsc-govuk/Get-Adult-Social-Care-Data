import {
  CustomGroupApiResponse,
  LocalAuthorityPeer,
  PeerGroupApiResponse,
  PeerGroupData,
} from './types';

// The peers data has no uniqueness guarantee (e.g. a peer group load that ran
// twice), and duplicate entries break the chart: Plotly merges bars that share
// a label while the highlight shape is positioned by raw index, extending the
// axis into blank rows. Keep the first entry per LA code.
const dedupeByCode = (peers: LocalAuthorityPeer[]): LocalAuthorityPeer[] => {
  const seenCodes = new Set<string>();
  return peers.filter(
    (peer) => !seenCodes.has(peer.code) && Boolean(seenCodes.add(peer.code))
  );
};

export const mapPeerGroupResponse = (
  raw: PeerGroupApiResponse
): PeerGroupData => ({
  localAuthorityPeers: dedupeByCode(
    (raw.local_authority_peers ?? []).map((peer, index) => ({
      code: peer.code ?? `peer-${index}`,
      displayName: peer.display_name ?? 'Unknown',
      peerRanking: peer.peer_ranking ?? index + 1,
      metricValue: peer.metric_value ?? null,
    }))
  ),
  averagePeerGroup: raw.average_peer_group ?? null,
  nationalAverage: raw.national_average ?? null,
});

export const mapCustomGroupResponse = (
  raw: CustomGroupApiResponse
): PeerGroupData => ({
  localAuthorityPeers: dedupeByCode(
    (raw.group_members ?? []).map((member, index) => ({
      code: member.code ?? `member-${index}`,
      displayName: member.display_name ?? 'Unknown',
      peerRanking: index + 1,
      metricValue: member.metric_value ?? null,
    }))
  ),
  averagePeerGroup: raw.custom_group_average ?? null,
  nationalAverage: raw.national_average ?? null,
});
