export interface LocalAuthorityPeer {
  code: string;
  displayName: string;
  peerRanking: number;
  metricValue: number | null;
}

export interface PeerGroupApiPeer {
  code?: string;
  display_name?: string;
  peer_ranking?: number;
  metric_value?: number | null;
}

export interface PeerGroupApiResponse {
  local_authority_peers?: PeerGroupApiPeer[];
  average_peer_group?: number | null;
  national_average?: number | null;
}

export interface PeerGroupData {
  localAuthorityPeers: LocalAuthorityPeer[];
  averagePeerGroup: number | null;
  nationalAverage: number | null;
  metric_id: string;
}

export interface PeerGroupBarChartProps {
  laCode: string;
  laName: string;
  currentLaValue: number | null;
  nationalAverageValue: number | null;
  metricCode?: string;
  metricDescription?: string;
  figureTitle?: string;
  figureNumber?: number;
}
