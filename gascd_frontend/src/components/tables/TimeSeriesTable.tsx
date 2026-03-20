import React, { Ref } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';

type DataTableProps = {
  caption?: React.ReactNode;
  metricColumnName?: string;
  columnHeaders: Array<string>;
  rowHeaders: Object;
  data: Indicator[];
  percentageRows?: string[];
  currency?: boolean;
  source?: string;
  last_updated?: string;
  children?: React.ReactNode;
  showAverageLabel?: boolean;
  tableref?: Ref<HTMLTableElement>;
};

const getFormattedDataPoint = (
  data: Indicator[],
  metricId: string,
  isPercentage: boolean = false,
  isCurrency: boolean = false,
  rowDate: string,
  showAverageLabel?: boolean
): string => {
  const foundMetric = data.find((metric) => {
    return metric.metric_id === metricId && metric.metric_date === rowDate;
  });

  if (
    foundMetric &&
    foundMetric.data_point !== null &&
    !isNaN(Number(foundMetric.data_point))
  ) {
    let formatted = Number(foundMetric.data_point).toLocaleString();
    if (isPercentage) formatted += '%';
    if (isCurrency) formatted = '£' + formatted;
    if (showAverageLabel)
      formatted += isPercentage ? ' (average)' : ' (median)';
    return formatted;
  } else if (foundMetric && foundMetric.data_point === null) {
    return '(*)';
  }
  return 'Loading...';
};

const DataTable: React.FC<DataTableProps> = ({
  caption,
  columnHeaders,
  metricColumnName = 'Indicator',
  rowHeaders,
  data,
  percentageRows,
  currency,
  children,
  source,
  showAverageLabel = false,
  tableref = undefined,
}) => {
  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header govuk-!-width-one-third scrollable-table__header';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric';
    }
  };

  return (
    <div>
      <div className="moj-scrollable-pane" role="region">
        <table className="govuk-table" ref={tableref}>
          {caption && (
            <caption className="govuk-table__caption govuk-table__caption--s">
              {caption}
            </caption>
          )}

          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th key="0" scope="col" className={columnClass(0)}>
                {metricColumnName}
              </th>
              {Object.entries(columnHeaders).map(
                ([columnKey, columnLabel], columnIndex) => (
                  <th
                    key={columnKey + 1}
                    scope="col"
                    className={columnClass(columnIndex + 1)}
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
                  className="govuk-table__cell govuk-!-font-weight-regular scrollable-table__header"
                >
                  {value}
                </th>
                {columnHeaders.map((columnKey) => (
                  <td
                    key={columnKey + 1}
                    className="govuk-table__cell govuk-table__cell--numeric"
                  >
                    {getFormattedDataPoint(
                      data,
                      key,
                      percentageRows?.some((item) => item === key) ?? false,
                      currency,
                      columnKey,
                      showAverageLabel
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {children}
      </div>
      <p className="govuk-body govuk-!-margin-bottom-0">Source: {source}</p>
    </div>
  );
};

export default DataTable;
