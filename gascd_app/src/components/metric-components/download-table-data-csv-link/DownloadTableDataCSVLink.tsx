import React, { RefObject, useState } from 'react';
import { downloadCSV } from '../../../helpers/downloadToCsvHelpers';
import Link from 'next/link';

type Props = {
  tableref?: RefObject<HTMLTableElement | null>;
  rawdata?: any[];
  filename?: string;
  xLabel: string;
};

function extractTableCellText(table: HTMLTableElement): string[][] {
  const rows = table.rows;
  const cellTexts: any[] = [];

  for (let row of rows) {
    const rowCells: string[] = [];
    for (let cell of row.cells) {
      rowCells.push(cell.textContent || '');
    }
    cellTexts.push(rowCells);
  }

  return cellTexts;
}

const DownloadTableDataCSVLink: React.FC<Props> = ({
  tableref,
  rawdata,
  filename = 'data.csv',
  xLabel,
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();

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
        Download table data (CSV)
      </Link>
    </>
  );
};

export default DownloadTableDataCSVLink;
