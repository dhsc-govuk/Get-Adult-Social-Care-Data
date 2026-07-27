import React from 'react';
import {
  CURRENT_LA_COLOUR,
  NATIONAL_AVG_COLOUR,
  PEER_AVG_COLOUR,
  PEER_LA_COLOUR,
} from './constants';

interface PeerGroupChartLegendProps {
  laName: string;
  peerGroupAverage: number | null;
  nationalAverage: number | null;
}

const formatPercentage = (value: number | null | undefined): string =>
  value !== null && value !== undefined ? `${value.toFixed(2)}%` : 'N/A';

const PeerGroupChartLegend: React.FC<PeerGroupChartLegendProps> = ({
  laName,
  peerGroupAverage,
  nationalAverage,
}) => (
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
        NHS Peer Group avg ({formatPercentage(peerGroupAverage)})
      </span>
    </li>
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: 32,
          borderTop: `2px dotted ${NATIONAL_AVG_COLOUR}`,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span className="govuk-body-s govuk-!-margin-bottom-0">
        National average ({formatPercentage(nationalAverage)})
      </span>
    </li>
  </ul>
);

export default PeerGroupChartLegend;
