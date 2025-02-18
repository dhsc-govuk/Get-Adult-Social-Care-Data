import React from 'react';

type DataTableProps = {
  columnHeaders: string[];
  rowHeaders: string[];
  data: Record<string, Record<string, string>>;
};

const DataTable: React.FC<DataTableProps> = ({
  columnHeaders,
  rowHeaders,
  data,
}) => {
  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-table__caption--m">
        Adult social care beds per 100,000 adult population at 24 December 2024
      </caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {columnHeaders.map((columnHeader, columnIndex) => (
            <th key={columnIndex} scope="col" className="govuk-table__header">
              {columnHeader}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {rowHeaders.map((rowHeader, rowIndex) => (
          <tr key={rowIndex} className="govuk-table__row">
            <td className="govuk-table__cell govuk-table__cell--header">
              {rowHeader}
            </td>
            {columnHeaders.slice(1).map((colHeader, colIndex) => (
              <td key={colIndex} className="govuk-table__cell">
                {data[rowHeader]?.[colHeader] || 'N/A'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
