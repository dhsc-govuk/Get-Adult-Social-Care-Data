import React, { useState } from 'react';
import { COMPARISON_GROUPS } from './constants';

interface PeerGroupChartHeaderProps {
  laName: string;
  metricDescription: string;
  figureTitle: string;
  figureNumber: number;
}

const PeerGroupChartHeader: React.FC<PeerGroupChartHeaderProps> = ({
  laName,
  metricDescription,
  figureTitle,
  figureNumber,
}) => {
  const [comparisonGroup, setComparisonGroup] = useState(
    COMPARISON_GROUPS[0].value
  );

  return (
    <>
      <p className="govuk-body govuk-!-font-weight-bold">Comparison group</p>
      <select
        className="govuk-select"
        value={comparisonGroup}
        onChange={(event) => setComparisonGroup(event.target.value)}
        aria-label="Select comparison group"
      >
        {COMPARISON_GROUPS.map((group) => (
          <option key={group.value} value={group.value}>
            {group.label}
          </option>
        ))}
      </select>
      <p className="govuk-body govuk-!-margin-top-4">
        This chart compares {laName} with its NHS Peer Group for{' '}
        {metricDescription}.
      </p>
      <p className="govuk-body govuk-!-font-weight-bold">
        Figure {figureNumber}: {figureTitle} &ndash; {laName} compared with peer
        group
      </p>
    </>
  );
};

export default PeerGroupChartHeader;
