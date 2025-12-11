import React, { Ref } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';

type DataTableProps = {
  caption?: string;
  columnHeaders: Object;
  rowHeaders: Object;
  data: Indicator[];
  percentageColumns?: string[];
  source?: string;
  last_updated?: string;
  children?: React.ReactNode;
  showAverageLabel?: boolean;
  tableref?: Ref<HTMLTableElement>;
};

const DataTable: React.FC<DataTableProps> = ({
  caption,
  columnHeaders,
  rowHeaders,
  data,
  children,
  source,
  tableref = undefined,
}) => {
  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header govuk-!-width-one-third';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric';
    }
  };

  const getFormattedDataPoint = (
    data: Indicator[],
    locationId: string,
    isPercentage: boolean = false,
    showAverageLabel?: boolean
  ): string => {
    const foundMetric = data.find(
      (metric) => metric.location_id === locationId
    );

    if (
      foundMetric &&
      foundMetric.data_point !== null &&
      !isNaN(Number(foundMetric.data_point))
    ) {
      let formatted = Number(foundMetric.data_point).toLocaleString();
      if (isPercentage) formatted += '%';
      if (showAverageLabel)
        formatted += isPercentage ? ' (average)' : ' (median)';
      return formatted;
    }
    return 'Loading...';
  };

  return (
    <div>
      <table className="govuk-table" ref={tableref}>
        {caption && (
          <caption className="govuk-table__caption govuk-table__caption--s">
            {caption}
          </caption>
        )}
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            {Object.entries(columnHeaders).map(
              ([columnKey, columnLabel], columnIndex) => (
                <th
                  key={columnKey}
                  scope="col"
                  className={columnClass(columnIndex)}
                >
                  {columnLabel}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {Object.entries(rowHeaders).map(([key, value]) => (
            <tr key={key}>
              <th
                scope="row"
                className="govuk-table__cell govuk-!-font-weight-regular"
              >
                {value}
              </th>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(data, key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
      <p className="govuk-body">Source: {source}</p>
    </div>
  );
};

export default DataTable;
