'use client';
import React from 'react';
import PeerGroupChartContent from './peer-group/PeerGroupChartContent';
import PeerGroupChartHeader from './peer-group/PeerGroupChartHeader';
import { PeerGroupBarChartProps } from './peer-group/types';

// Presentational: peer/custom-group data is fetched once at page level (see
// peer-group/usePeerGroupData.ts) and shared with the Table and Download tabs.
const PeerGroupBarChart: React.FC<PeerGroupBarChartProps> = ({
  laCode,
  laName,
  currentLaValue,
  nationalAverageValue,
  peerData,
  loading,
  error,
  metricDescription = 'the percentage of households deprived in 4 dimensions',
  figureTitle = 'Percentage of households deprived in 4 dimensions',
  figureNumber = 1,
  comparatorControl,
  comparatorLabel,
  comparatorAverageLabel,
  nationalAverageLabel,
  valueSuffix,
  sourceText,
}) => {
  if (!laCode || laCode === 'Loading...' || laCode === 'undefined') {
    return <p className="govuk-body">Loading...</p>;
  }

  return (
    <div>
      <PeerGroupChartHeader
        laName={laName}
        metricDescription={metricDescription}
        figureTitle={figureTitle}
        figureNumber={figureNumber}
        comparatorControl={comparatorControl}
        comparatorLabel={comparatorLabel}
      />
      {loading && <p className="govuk-body">Loading...</p>}
      {/* The chart benchmarks the user's own LA against the comparator group,
          so it is only complete once both the comparator data and the LA's
          own value have resolved. The LA value can be missing for a single
          metric even when the page-level request succeeded (the metric-data
          route skips metrics whose upstream call failed, and the API omits
          locations with no data), so this is checked per chart. */}
      {!loading && (error || !peerData || currentLaValue === null) && (
        <p className="govuk-body">Data not available</p>
      )}
      {!loading && !error && peerData && currentLaValue !== null && (
        <PeerGroupChartContent
          laName={laName}
          currentLaValue={currentLaValue}
          nationalAverageValue={nationalAverageValue}
          peerData={peerData}
          ownLaCode={laCode}
          comparatorAverageLabel={comparatorAverageLabel}
          nationalAverageLabel={nationalAverageLabel}
          valueSuffix={valueSuffix}
          sourceText={sourceText}
        />
      )}
    </div>
  );
};

export default PeerGroupBarChart;
