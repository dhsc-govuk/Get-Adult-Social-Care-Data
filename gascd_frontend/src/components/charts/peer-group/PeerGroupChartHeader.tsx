import React, { ReactNode } from 'react';
import { NHS_PEER_GROUP_COMPARATOR_LABEL } from './constants';

interface PeerGroupChartHeaderProps {
  laName: string;
  metricDescription: string;
  figureTitle: string;
  figureNumber: number;
  // The comparison group control (select + builder panel), owned by the page.
  comparatorControl?: ReactNode;
  // How the comparison set is referred to in the summary sentence,
  // e.g. "its NHS Peer Group" or a custom group's name.
  comparatorLabel?: string;
}

const PeerGroupChartHeader: React.FC<PeerGroupChartHeaderProps> = ({
  laName,
  metricDescription,
  figureTitle,
  figureNumber,
  comparatorControl,
  comparatorLabel = NHS_PEER_GROUP_COMPARATOR_LABEL,
}) => {
  return (
    <>
      {comparatorControl}
      <p className="govuk-body govuk-!-margin-top-4">
        This chart compares {laName} with {comparatorLabel} for{' '}
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
