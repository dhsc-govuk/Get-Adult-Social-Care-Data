'use client';

import React, { RefObject, useState } from 'react';
import {
  downloadCSV,
  extractTableCellText,
} from '../../../helpers/downloadToCsvHelpers';
import Link from 'next/link';
import AnalyticsService from '@/services/analytics/analyticsService';
import { useSharingCategory } from '@/components/data-components/SharingCategoryContext';
import { getSharingCsvNotice } from '@/data/sharingCategories';

type Props = {
  tableref?: RefObject<HTMLTableElement | null>;
  rawdata?: any[];
  // Rows fetched when the link is selected, for data not all held on the page
  fetchRawData?: () => Promise<any[]>;
  filename?: string;
  xLabel: string;
  downloadType: string;
  // Lines placed above the data, after any sharing guidance: what the table
  // was filtered to, its date and its source, say
  notes?: string[];
};

const DownloadTableDataCSVLink: React.FC<Props> = ({
  tableref,
  rawdata,
  fetchRawData,
  filename = 'data.csv',
  xLabel,
  downloadType,
  notes = [],
}) => {
  // Taken from the surrounding tabs, so the guidance in the CSV always matches
  // the label shown above the figure
  const sharingCategory = useSharingCategory();
  const [fetchFailed, setFetchFailed] = useState(false);

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    AnalyticsService.trackDownloadCSV(filename);

    const notice = [...getSharingCsvNotice(sharingCategory), ...notes];

    if (fetchRawData) {
      setFetchFailed(false);
      try {
        downloadCSV(await fetchRawData(), filename, xLabel, notice);
      } catch (error) {
        console.error('Error fetching data to export:', error);
        setFetchFailed(true);
      }
    } else if (tableref?.current) {
      const csv_data = extractTableCellText(tableref.current);
      downloadCSV(csv_data, filename, xLabel, notice);
    } else if (rawdata?.length) {
      downloadCSV(rawdata, filename, xLabel, notice);
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
      {/* Only a fetched download can fail; on the page before it does, so the
          message is announced */}
      {fetchRawData && (
        <div role="status">
          {fetchFailed && (
            <p className="govuk-body govuk-!-margin-top-2">
              The data could not be downloaded. Try again later.
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default DownloadTableDataCSVLink;
