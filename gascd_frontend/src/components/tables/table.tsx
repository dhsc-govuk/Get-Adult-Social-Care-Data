import React, { Ref } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';

type DataTableProps = {
  caption?: React.ReactNode;
  columnHeaders: Object;
  metricColumnName?: string;
  rowHeaders: Object;
  data: Indicator[];
  showCareProvider: boolean;
  careProviderMedianMetrics?: Record<string, string>;
  percentageRows?: string[];
  currency?: boolean;
  source?: string;
  last_updated?: string;
  children?: React.ReactNode;
  showAverageLabel?: boolean;
  tableref?: Ref<HTMLTableElement>;
  smallNumberSuppression?: boolean;
};

const getCareProviderKey = (
  key: string,
  careProviderMedianMetrics?: Record<string, string>
): string => {
  return careProviderMedianMetrics ? careProviderMedianMetrics[key] : ' ';
};

const DataTable: React.FC<DataTableProps> = ({
  caption,
  columnHeaders,
  metricColumnName = 'Indicator',
  rowHeaders,
  data,
  showCareProvider,
  careProviderMedianMetrics,
  percentageRows,
  currency,
  children,
  source,
  showAverageLabel = false,
  tableref = undefined,
  smallNumberSuppression = false,
}) => {
  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header govuk-!-width-one-third scrollable-table__header';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric scrollable-table__header';
    }
  };

  const getFormattedDataPoint = (
    data: Indicator[],
    metricId: string,
    locationType: string,
    isPercentage: boolean = false,
    isCurrency: boolean = false,
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
      if (isCurrency) formatted = '£' + formatted;
      if (showAverageLabel)
        formatted += isPercentage ? ' (average)' : ' (median)';
      return formatted;
    } else if (
      foundMetric &&
      foundMetric.data_point === null &&
      smallNumberSuppression
    ) {
      // Small number suppression support
      return '(*)';
    } else if (data && data.length) {
      // data exists but we couldn't find a matching value
      return '--';
    } else {
      // Data is not actually available, so we assume we're loading
      return 'Loading...';
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
              {Object.entries(columnHeaders)
                .filter(
                  ([columnKey]) =>
                    !(columnKey === 'CPLabel' && !showCareProvider)
                )
                .map(([columnKey, columnLabel], columnIndex) => (
                  <th
                    key={columnKey + 1}
                    scope="col"
                    className={columnClass(columnIndex + 1)}
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
                      'CareProviderLocation',
                      percentageRows?.some((item) => item === key) ?? false,
                      currency
                    )}
                  </td>
                )}
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {getFormattedDataPoint(
                    data,
                    key,
                    'LA',
                    percentageRows?.some((item) => item === key) ?? false,
                    currency,
                    showAverageLabel
                  )}
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {getFormattedDataPoint(
                    data,
                    key,
                    'Regional',
                    percentageRows?.some((item) => item === key) ?? false,
                    currency,
                    showAverageLabel
                  )}
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {getFormattedDataPoint(
                    data,
                    key,
                    'National',
                    percentageRows?.some((item) => item === key) ?? false,
                    currency,
                    showAverageLabel
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children}
      <p className="govuk-body govuk-!-margin-bottom-0">Source: {source}</p>
    </div>
  );
};

export default DataTable;
