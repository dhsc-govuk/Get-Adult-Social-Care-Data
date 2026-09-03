import React from 'react';
import {
  CURRENT_LA_COLOUR,
  NATIONAL_AVG_COLOUR,
  PEER_AVG_COLOUR,
  PEER_LA_COLOUR,
} from './constants';

import { NHS_PEER_GROUP_AVERAGE_LABEL } from './constants';

interface PeerGroupChartLegendProps {
  laName: string;
  peerGroupAverage: number | null;
  nationalAverage: number | null;
  // Legend label for the comparator average line, e.g. "NHS peer group
  // average" or "{group name} average".
  comparatorAverageLabel?: string;
  // Legend label for the national average line.
  nationalAverageLabel?: string;
  valueSuffix?: string;
}

const PeerGroupChartLegend: React.FC<PeerGroupChartLegendProps> = ({
  laName,
  peerGroupAverage,
  nationalAverage,
  comparatorAverageLabel = NHS_PEER_GROUP_AVERAGE_LABEL,
  nationalAverageLabel = 'England (national average)',
  valueSuffix = '%',
}) => {
  const formatValue = (value: number | null | undefined): string =>
    value !== null && value !== undefined
      ? `${value.toFixed(1)}${valueSuffix}`
      : 'N/A';

  return (
  <ul
    className="govuk-list govuk-!-margin-bottom-4"
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: 0,
    }}
  >
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          background: CURRENT_LA_COLOUR,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span className="govuk-body-s govuk-!-margin-bottom-0">{laName}</span>
    </li>
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          background: PEER_LA_COLOUR,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span className="govuk-body-s govuk-!-margin-bottom-0">Peer group</span>
    </li>
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: 32,
          borderTop: `2px dotted ${PEER_AVG_COLOUR}`,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span className="govuk-body-s govuk-!-margin-bottom-0">
        {comparatorAverageLabel} ({formatValue(peerGroupAverage)})
      </span>
    </li>
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: 32,
          borderTop: `2px dashed ${NATIONAL_AVG_COLOUR}`,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span className="govuk-body-s govuk-!-margin-bottom-0">
        {nationalAverageLabel} ({formatValue(nationalAverage)})
      </span>
    </li>
  </ul>
  );
};

export default PeerGroupChartLegend;
