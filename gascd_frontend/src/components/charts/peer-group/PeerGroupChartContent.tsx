'sue client';
import React, { useMemo } from 'react';
import { Shape } from 'plotly.js';
import BarChart from '../BarChart';
import PeerGroupChartHeader from './PeerGroupChartHeader';
import PeerGroupChartLegend from './PeerGroupChartLegend';
import { NATIONAL_AVG_COLOUR, PEER_AVG_COLOUR } from './constants';
import { PeerGroupData } from './types';

interface PeerGroupChartContentProps {
  laName: string;
  currentLaValue: number | null;
  nationalAverageValue: number | null;
  peerData: PeerGroupData;
  figure: {
    title: string;
    description: string;
  };
}

const roundToOneDecimal = (value: number | null): number | null =>
  value !== null ? Math.round(value * 10) / 10 : null;

const PeerGroupChartContent: React.FC<PeerGroupChartContentProps> = ({
  laName,
  currentLaValue,
  nationalAverageValue,
  figure,
  peerData,
}) => {
  const hasPeers = peerData.localAuthorityPeers.length > 0;

  const { categories, values } = useMemo(() => {
    if (!hasPeers) return { categories: [], values: [] };

    const allItems: { name: string; value: number }[] = [
      ...(currentLaValue !== null
        ? [{ name: laName, value: currentLaValue }]
        : []),
      ...peerData.localAuthorityPeers
        .filter((peer) => peer.metricValue !== null)
        .map((peer) => ({
          name: peer.displayName,
          value: peer.metricValue as number,
        })),
    ];

    const sorted = [...allItems].sort((a, b) => b.value - a.value);

    return {
      categories: sorted.map((item) => item.name),
      values: sorted.map((item) => item.value),
    };
  }, [currentLaValue, hasPeers, laName, peerData.localAuthorityPeers]);

  const referenceShapes = useMemo((): Partial<Shape>[] => {
    const shapes: Partial<Shape>[] = [];
    const resolvedPeerGroupAverage = roundToOneDecimal(
      peerData.averagePeerGroup
    );
    const resolvedNationalAverage = roundToOneDecimal(
      nationalAverageValue ?? peerData.nationalAverage
    );

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
  }, [
    nationalAverageValue,
    peerData.averagePeerGroup,
    peerData.nationalAverage,
  ]);

  if (!hasPeers) {
    return (
      <p className="govuk-body">
        This chart is not available to your Local Authority.
      </p>
    );
  }

  const resolvedNationalAverage = roundToOneDecimal(
    nationalAverageValue ?? peerData.nationalAverage
  );

  return (
    <div>
      <PeerGroupChartHeader
        description={figure.description}
        title={figure.title}
      />
      <PeerGroupChartLegend
        laName={laName}
        peerGroupAverage={roundToOneDecimal(peerData.averagePeerGroup)}
        nationalAverage={resolvedNationalAverage}
      />
      {categories.length > 0 && (
        <div style={{ height: `${Math.max(400, categories.length * 50)}px` }}>
          <BarChart
            categories={categories}
            values={values}
            highlightCategory={laName}
            darkBlueCount={0}
            additionalShapes={referenceShapes}
            xAxisTickSuffix="%"
            hoverValueFormat=".1f"
          />
        </div>
      )}
    </div>
  );
};

export default PeerGroupChartContent;
