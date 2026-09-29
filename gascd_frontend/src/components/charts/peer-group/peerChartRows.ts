import { PeerGroupData } from './types';

export interface PeerChartRow {
  name: string;
  value: number;
}

// The bars a peer group chart shows: the user's LA and each peer with a
// value, highest first. Shared with PeerGroupTable so the two always match.
export const getPeerChartRows = (
  laName: string,
  currentLaValue: number | null,
  peerData: PeerGroupData,
  ownLaCode?: string
): PeerChartRow[] => {
  // A custom group can contain the user's own LA; it is shown once, as theirs
  const peers = ownLaCode
    ? peerData.localAuthorityPeers.filter((peer) => peer.code !== ownLaCode)
    : peerData.localAuthorityPeers;

  const rows: PeerChartRow[] = [
    ...(currentLaValue !== null
      ? [{ name: laName, value: currentLaValue }]
      : []),
    ...peers
      .filter((peer) => peer.metricValue !== null)
      .map((peer) => ({
        name: peer.displayName,
        value: peer.metricValue as number,
      })),
  ].sort((a, b) => b.value - a.value);

  // Plotly's categorical axis merges rows that share a label, which would
  // leave the highlight shape positioned past the end of the axis and the
  // chart rendering blank label-less rows below the bars. Distinct LAs never
  // share a name, so keep one bar per label (the sort means the highest
  // value survives) - this also drops an LA that appears under both an old
  // and a new ONS code.
  const seenNames = new Set<string>();
  return rows.filter(
    (row) => !seenNames.has(row.name) && Boolean(seenNames.add(row.name))
  );
};
