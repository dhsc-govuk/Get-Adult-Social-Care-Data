import React from 'react';
import ComparisonNHSPeerGroup from '@/components/benchmarking/nhs-peer-comparison-group';

type Props = {
  title: string;
  description: string;
};

const PeerGroupChartHeader: React.FC<Props> = ({ description, title }) => {
  return (
    <>
      <ComparisonNHSPeerGroup description={description} />
      <p className="govuk-body govuk-!-font-weight-bold">{title}</p>
    </>
  );
};

export default PeerGroupChartHeader;
