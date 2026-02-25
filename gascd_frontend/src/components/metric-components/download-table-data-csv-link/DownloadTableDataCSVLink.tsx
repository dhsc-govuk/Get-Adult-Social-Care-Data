import React, { RefObject } from 'react';
import {
  downloadCSV,
  extractTableCellText,
} from '../../../helpers/downloadToCsvHelpers';
import Link from 'next/link';
import AnalyticsService from '@/services/analytics/analyticsService';

type Props = {
  tableref?: RefObject<HTMLTableElement | null>;
  rawdata?: any[];
  filename?: string;
  xLabel: string;
  downloadType: string;
};

const DownloadTableDataCSVLink: React.FC<Props> = ({
  tableref,
  rawdata,
  filename = 'data.csv',
  xLabel,
  downloadType,
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    AnalyticsService.trackDownloadCSV(filename);

    if (tableref?.current) {
      const csv_data = extractTableCellText(tableref.current);
      downloadCSV(csv_data, filename, xLabel);
    } else if (rawdata?.length) {
      downloadCSV(rawdata, filename, xLabel);
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
        Export {downloadType} table data (CSV)
      </Link>
    </>
  );
};

export default DownloadTableDataCSVLink;
