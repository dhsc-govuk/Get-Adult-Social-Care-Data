import React, { useState } from 'react';
import { downloadCSV } from '../../../helpers/downloadToCsvHelpers';
import Link from 'next/link';

type Props = {
  data: any[];
  filename?: string;
  xLabel: string;
};

const DownloadTableDataCSVLink: React.FC<Props> = ({
  data,
  filename = 'data.csv',
  xLabel,
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadCSV(data, filename, xLabel);
  };

  return (
    <>
      <Link
        href="#"
        className="govuk-link govuk-body"
        onClick={handleDownloadClick}
      >
        Download table data (CSV)
      </Link>
    </>
  );
};

export default DownloadTableDataCSVLink;
