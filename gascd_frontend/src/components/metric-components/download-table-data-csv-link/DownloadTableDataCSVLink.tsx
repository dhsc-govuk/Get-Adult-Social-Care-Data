import React, { RefObject } from 'react';
import {
  downloadCSV,
  extractTableCellText,
} from '../../../helpers/downloadToCsvHelpers';
import Link from 'next/link';

type Props = {
  tableref?: RefObject<HTMLTableElement | null>;
  rawdata?: any[];
  filename?: string;
  xLabel: string;
  metricTypes?: string[];
};

const DownloadTableDataCSVLink: React.FC<Props> = ({
  tableref,
  rawdata,
  filename = 'data.csv',
  xLabel,
  metricTypes = null,
}) => {
  let downloadData = rawdata;

  if (metricTypes && rawdata) {
    downloadData = rawdata.filter((metric) =>
      metricTypes.includes(metric.metric_id)
    );
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (tableref?.current) {
      const csv_data = extractTableCellText(tableref.current);
      downloadCSV(csv_data, filename, xLabel);
    } else if (downloadData?.length) {
      downloadCSV(downloadData, filename, xLabel);
    } else {
      console.error('No exportable table data found');
    }
  };

  return (
    <>
      <Link
        href="#"
        className="govuk-link govuk-body"
        onClick={handleDownloadClick}
      >
        Export table data (CSV)
      </Link>
    </>
  );
};

export default DownloadTableDataCSVLink;
