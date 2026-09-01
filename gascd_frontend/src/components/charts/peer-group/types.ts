import { ReactNode } from 'react';

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

export interface CustomGroupApiMember {
  code?: string;
  display_name?: string;
  metric_value?: number | null;
}

export interface CustomGroupApiResponse {
  group_members?: CustomGroupApiMember[];
  custom_group_average?: number | null;
  national_average?: number | null;
}

export interface PeerGroupData {
  localAuthorityPeers: LocalAuthorityPeer[];
  averagePeerGroup: number | null;
  nationalAverage: number | null;
}

export interface CustomComparatorGroup {
  id: string;
  name: string;
  laCodes: string[];
}

export type ComparatorSelection =
  | { kind: 'nhs_peer_group' }
  | { kind: 'custom'; groupId: string };

export interface LocalAuthoritySummary {
  laCode: string;
  laName: string;
  regionName?: string;
}

export interface PeerGroupBarChartProps {
  laCode: string;
  laName: string;
  currentLaValue: number | null;
  nationalAverageValue: number | null;
  peerData: PeerGroupData | null;
  loading: boolean;
  error: boolean;
  metricDescription?: string;
  figureTitle?: string;
  figureNumber?: number;
  comparatorControl?: ReactNode;
  comparatorLabel?: string;
  comparatorAverageLabel?: string;
  valueSuffix?: string;
  sourceText?: string;
}
