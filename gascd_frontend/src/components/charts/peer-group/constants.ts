export type ComparisonGroup = {
  value: string;
  label: string;
};

export const NHS_PEER_GROUP_VALUE = 'nhs_peer_group';
export const CUSTOM_NEW_VALUE = 'custom';
export const CUSTOM_GROUP_VALUE_PREFIX = 'custom:';

export const NHS_PEER_GROUP_LABEL = 'Statistically similar peer group (NHS)';
export const NHS_PEER_GROUP_AVERAGE_LABEL = 'NHS peer group average';
export const NHS_PEER_GROUP_COMPARATOR_LABEL = 'its NHS Peer Group';

export const COMPARISON_GROUPS: ComparisonGroup[] = [
  { value: NHS_PEER_GROUP_VALUE, label: NHS_PEER_GROUP_LABEL },
];

export const CURRENT_LA_COLOUR = '#1f6095';
export const PEER_LA_COLOUR = '#959495';
export const PEER_AVG_COLOUR = '#d4351c';
export const NATIONAL_AVG_COLOUR = '#871a5b';
