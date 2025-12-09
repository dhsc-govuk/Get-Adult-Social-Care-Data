import React, { useRef } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';
import { MetaData } from '@/data/interfaces/MetaData';

type DataTableProps = {
  caption?: string;
  columnHeaders: Object;
  rowHeaders: Object;
  data: Indicator[];
  showCareProvider: boolean;
  careProviderMedianMetrics?: Record<string, string>;
  percentageRows?: string[];
  source?: string;
  last_updated?: string;
  children?: React.ReactNode;
  showAverageLabel?: boolean;
};

const getCareProviderKey = (
  key: string,
  careProviderMedianMetrics?: Record<string, string>
): string => {
  return careProviderMedianMetrics ? careProviderMedianMetrics[key] : ' ';
};

const getFormattedDataPoint = (
  data: Indicator[],
  metricId: string,
  locationType: string,
  isPercentage: boolean = false,
  showAverageLabel?: boolean
): string => {
  const foundMetric = data.find(
    (metric) =>
      metric.metric_id === metricId && metric.location_type === locationType
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

const DataTable: React.FC<DataTableProps> = ({
  caption,
  columnHeaders,
  rowHeaders,
  data,
  showCareProvider,
  careProviderMedianMetrics,
  percentageRows,
  children,
  source,
  showAverageLabel = false,
}) => {
  const tableref = useRef<HTMLTableElement>(null);
  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header govuk-!-width-one-third';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric';
    }
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
            {Object.entries(columnHeaders)
              .filter(
                ([columnKey]) => !(columnKey === 'CPLabel' && !showCareProvider)
              )
              .map(([columnKey, columnLabel], columnIndex) => (
                <th
                  key={columnKey}
                  scope="col"
                  className={columnClass(columnIndex)}
                >
                  {columnLabel}
                </th>
              ))}
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
              {showCareProvider && (
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {getFormattedDataPoint(
                    data,
                    getCareProviderKey(key, careProviderMedianMetrics),
                    'Care provider location',
                    percentageRows?.some((item) => item === key) ?? false
                  )}
                </td>
              )}
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'LA',
                  percentageRows?.some((item) => item === key) ?? false,
                  showAverageLabel
                )}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'Regional',
                  percentageRows?.some((item) => item === key) ?? false,
                  showAverageLabel
                )}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'National',
                  percentageRows?.some((item) => item === key) ?? false,
                  showAverageLabel
                )}
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
