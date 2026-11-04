import React, { useMemo } from 'react';
import { Shape } from 'plotly.js';
import BarChart from '../BarChart';
import PeerGroupChartLegend from './PeerGroupChartLegend';
import {
  NATIONAL_AVG_COLOUR,
  PEER_AVG_COLOUR,
  NHS_PEER_GROUP_AVERAGE_LABEL,
  REGIONAL_AVG_COLOUR,
} from './constants';
import { PeerGroupData } from './types';
import { getPeerChartRows } from './peerChartRows';

interface PeerGroupChartContentProps {
  laName: string;
  currentLaValue: number | null;
  // The England value from the same metric-data query the tables use. It is
  // deliberately the only source of the national figure so the chart and the
  // table can never disagree; peerData.nationalAverage is not used as a
  // fallback because the peers API does not filter National rows by code.
  nationalAverageValue: number | null;
  // The user's region value from the same metric-data query the tables use,
  // for the same reason as the national average.
  regionalAverageValue: number | null;
  peerData: PeerGroupData;
  // The user's own LA code - excluded from the peer rows so a custom group
  // containing the user's LA cannot render it twice.
  ownLaCode?: string;
  comparatorAverageLabel?: string;
  // The region's LAs are the bars, so the comparator line is the NHS peer group
  comparatorIsRegion?: boolean;
  regionalAverageLabel?: string;
  nationalAverageLabel?: string;
  valueSuffix: string;
  currency: boolean;
  sourceText: string;
}

const roundToOneDecimal = (value: number | null): number | null =>
  value !== null ? Math.round(value * 10) / 10 : null;

const PeerGroupChartContent: React.FC<PeerGroupChartContentProps> = ({
  laName,
  currentLaValue,
  nationalAverageValue,
  regionalAverageValue,
  peerData,
  ownLaCode,
  comparatorAverageLabel,
  comparatorIsRegion = false,
  regionalAverageLabel,
  nationalAverageLabel,
  valueSuffix,
  currency,
  sourceText,
}) => {
  const hasPeers = peerData.localAuthorityPeers.length > 0;

  const { categories, values } = useMemo(() => {
    if (!hasPeers) return { categories: [], values: [] };
    const rows = getPeerChartRows(laName, currentLaValue, peerData, ownLaCode);
    return {
      categories: rows.map((row) => row.name),
      values: rows.map((row) => row.value),
    };
  }, [currentLaValue, hasPeers, laName, ownLaCode, peerData]);

  const comparatorAverage = comparatorIsRegion
    ? (peerData.nhsPeerGroupAverage ?? null)
    : peerData.averagePeerGroup;
  const comparatorLineLabel = comparatorIsRegion
    ? NHS_PEER_GROUP_AVERAGE_LABEL
    : comparatorAverageLabel;

  const referenceShapes = useMemo((): Partial<Shape>[] => {
    const shapes: Partial<Shape>[] = [];
    const resolvedPeerGroupAverage = roundToOneDecimal(comparatorAverage);
    const resolvedNationalAverage = roundToOneDecimal(nationalAverageValue);
    const resolvedRegionalAverage = roundToOneDecimal(regionalAverageValue);

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

    if (resolvedRegionalAverage !== null) {
      shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: resolvedRegionalAverage,
        x1: resolvedRegionalAverage,
        y0: 0,
        y1: 1,
        line: { color: REGIONAL_AVG_COLOUR, width: 2, dash: 'dot' },
      });
    }

    return shapes;
  }, [comparatorAverage, nationalAverageValue, regionalAverageValue]);

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
        peerGroupAverage={roundToOneDecimal(comparatorAverage)}
        nationalAverage={resolvedNationalAverage}
        regionalAverage={roundToOneDecimal(regionalAverageValue)}
        comparatorAverageLabel={comparatorLineLabel}
        regionalAverageLabel={regionalAverageLabel}
        nationalAverageLabel={nationalAverageLabel}
        valueSuffix={valueSuffix}
        currency={currency}
      />
      {categories.length > 0 && (
        <div style={{ height: `${Math.max(400, categories.length * 50)}px` }}>
          <BarChart
            categories={categories}
            values={values}
            highlightCategory={laName}
            darkBlueCount={0}
            additionalShapes={referenceShapes}
            xAxisTickPrefix={currency ? '£' : undefined}
            xAxisTickSuffix={currency ? undefined : valueSuffix}
            hoverValueFormat={currency ? ',.0f' : '.1f'}
          />
        </div>
      )}
      <p className="govuk-body">{sourceText}</p>
    </div>
  );
};

export default PeerGroupChartContent;
