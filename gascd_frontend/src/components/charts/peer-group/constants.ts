export type ComparisonGroup = {
  value: string;
  label: string;
};

export const COMPARISON_GROUPS: ComparisonGroup[] = [
  { value: 'nhs_peer_group', label: 'NHS Peer Group' },
];

export const CURRENT_LA_COLOUR = '#1f6095';
export const PEER_LA_COLOUR = '#959495';
export const PEER_AVG_COLOUR = '#d4351c';
export const NATIONAL_AVG_COLOUR = '#871a5b';
