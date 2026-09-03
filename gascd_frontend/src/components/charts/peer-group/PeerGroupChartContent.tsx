import React, { useMemo } from 'react';
import { Shape } from 'plotly.js';
import BarChart from '../BarChart';
import PeerGroupChartLegend from './PeerGroupChartLegend';
import { NATIONAL_AVG_COLOUR, PEER_AVG_COLOUR } from './constants';
import { PeerGroupData } from './types';

interface PeerGroupChartContentProps {
  laName: string;
  currentLaValue: number | null;
  // The England value from the same metric-data query the tables use. It is
  // deliberately the only source of the national figure so the chart and the
  // table can never disagree; peerData.nationalAverage is not used as a
  // fallback because the peers API does not filter National rows by code.
  nationalAverageValue: number | null;
  peerData: PeerGroupData;
  // The user's own LA code - excluded from the peer rows so a custom group
  // containing the user's LA cannot render it twice.
  ownLaCode?: string;
  comparatorAverageLabel?: string;
  nationalAverageLabel?: string;
  valueSuffix?: string;
  sourceText?: string;
}

const roundToOneDecimal = (value: number | null): number | null =>
  value !== null ? Math.round(value * 10) / 10 : null;

const PeerGroupChartContent: React.FC<PeerGroupChartContentProps> = ({
  laName,
  currentLaValue,
  nationalAverageValue,
  peerData,
  ownLaCode,
  comparatorAverageLabel,
  nationalAverageLabel,
  valueSuffix = '%',
  sourceText = 'Source: Census 2021 from the Office for National Statistics (ONS)',
}) => {
  const hasPeers = peerData.localAuthorityPeers.length > 0;

  const { categories, values } = useMemo(() => {
    if (!hasPeers) return { categories: [], values: [] };

    const peers = ownLaCode
      ? peerData.localAuthorityPeers.filter((peer) => peer.code !== ownLaCode)
      : peerData.localAuthorityPeers;

    const allItems: { name: string; value: number }[] = [
      ...(currentLaValue !== null
        ? [{ name: laName, value: currentLaValue }]
        : []),
      ...peers
        .filter((peer) => peer.metricValue !== null)
        .map((peer) => ({
          name: peer.displayName,
          value: peer.metricValue as number,
        })),
    ];

    const sorted = [...allItems].sort((a, b) => b.value - a.value);

    // Plotly's categorical axis merges rows that share a label, which would
    // leave the highlight shape positioned past the end of the axis and the
    // chart rendering blank label-less rows below the bars. Distinct LAs never
    // share a name, so keep one bar per label (the sort means the highest
    // value survives) - this also drops an LA that appears under both an old
    // and a new ONS code.
    const seenNames = new Set<string>();
    const uniqueItems = sorted.filter(
      (item) => !seenNames.has(item.name) && Boolean(seenNames.add(item.name))
    );

    return {
      categories: uniqueItems.map((item) => item.name),
      values: uniqueItems.map((item) => item.value),
    };
  }, [
    currentLaValue,
    hasPeers,
    laName,
    ownLaCode,
    peerData.localAuthorityPeers,
  ]);

  const referenceShapes = useMemo((): Partial<Shape>[] => {
    const shapes: Partial<Shape>[] = [];
    const resolvedPeerGroupAverage = roundToOneDecimal(
      peerData.averagePeerGroup
    );
    const resolvedNationalAverage = roundToOneDecimal(nationalAverageValue);

    if (resolvedPeerGroupAverage !== null) {
      shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: resolvedPeerGroupAverage,
        x1: resolvedPeerGroupAverage,
        y0: 0,
        y1: 1,
        line: { color: PEER_AVG_COLOUR, width: 2, dash: 'dot' },
      });
    }

    if (resolvedNationalAverage !== null) {
      shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: resolvedNationalAverage,
        x1: resolvedNationalAverage,
        y0: 0,
        y1: 1,
        line: { color: NATIONAL_AVG_COLOUR, width: 2, dash: 'dash' },
      });
    }

    return shapes;
  }, [nationalAverageValue, peerData.averagePeerGroup]);

  if (!hasPeers) {
    return (
      <p className="govuk-body">
        This chart is not available to your Local Authority.
      </p>
    );
  }

  const resolvedNationalAverage = roundToOneDecimal(nationalAverageValue);

  return (
    <div>
      <PeerGroupChartLegend
        laName={laName}
        peerGroupAverage={roundToOneDecimal(peerData.averagePeerGroup)}
        nationalAverage={resolvedNationalAverage}
        comparatorAverageLabel={comparatorAverageLabel}
        nationalAverageLabel={nationalAverageLabel}
        valueSuffix={valueSuffix}
      />
      {categories.length > 0 && (
        <div style={{ height: `${Math.max(400, categories.length * 50)}px` }}>
          <BarChart
            categories={categories}
            values={values}
            highlightCategory={laName}
            darkBlueCount={0}
            additionalShapes={referenceShapes}
            xAxisTickSuffix={valueSuffix}
            hoverValueFormat=".1f"
          />
        </div>
      )}
      <p className="govuk-body">{sourceText}</p>
    </div>
  );
};

export default PeerGroupChartContent;
