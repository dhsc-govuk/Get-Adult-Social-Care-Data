'use client';
import React, { useState } from 'react';
import { COMPARISON_GROUPS } from './constants';

type Props = {
  title: string;
  description: string;
};

const PeerGroupChartHeader: React.FC<Props> = ({ description, title }) => {
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
      <p className="govuk-body govuk-!-margin-top-4">{description}</p>
      <p className="govuk-body govuk-!-font-weight-bold">{title}</p>
    </>
  );
};

export default PeerGroupChartHeader;
