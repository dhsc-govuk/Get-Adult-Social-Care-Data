'use client';
import React, { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import PeerGroupChartContent from './peer-group/PeerGroupChartContent';
import { mapPeerGroupResponse } from './peer-group/MapPeerGroupResponse';
import {
  PeerGroupApiResponse,
  PeerGroupBarChartProps,
  PeerGroupData,
} from './peer-group/types';

const PeerGroupBarChart: React.FC<PeerGroupBarChartProps> = ({
  laCode,
  laName,
  currentLaValue,
  nationalAverageValue,
  metricCode = 'perc_households_deprivation_deprived',
  metricDescription = 'the percentage of households deprived in 4 dimensions',
  figureTitle = 'Percentage of households deprived in 4 dimensions',
  figureNumber = 1,
}) => {
  const [peerData, setPeerData] = useState<PeerGroupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!laCode || laCode === 'Loading...' || laCode === 'undefined') {
      setPeerData(null);
      setError(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(
      withBasePath(
        `/api/get_la_peers?la_code=${encodeURIComponent(laCode)}&metric_code=${encodeURIComponent(metricCode)}`
      )
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: PeerGroupApiResponse) => {
        setPeerData(mapPeerGroupResponse(data));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [laCode, metricCode]);

  if (!laCode || laCode === 'Loading...') {
    return <p className="govuk-body">Loading...</p>;
  }

  if (loading) {
    return <p className="govuk-body">Loading...</p>;
  }

  if (error || !peerData) {
    return <p className="govuk-body">Data not available</p>;
  }

  return (
    <PeerGroupChartContent
      laName={laName}
      currentLaValue={currentLaValue}
      nationalAverageValue={nationalAverageValue}
      metricDescription={metricDescription}
      figureTitle={figureTitle}
      figureNumber={figureNumber}
      peerData={peerData}
    />
  );
};

export default PeerGroupBarChart;
