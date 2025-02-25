import React from 'react';
import { Indicator } from '@/data/interfaces/Indicator';
import { da } from '@faker-js/faker';

type DataTableProps = {
  columnHeaders: string[];
  rowHeaders: Object;
  data: Indicator[];
  showCareProvider: boolean;
  careProviderMedianMetrics?: Record<string, string>;
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
  locationType: string
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
    const dataPoint = Number(foundMetric.data_point);
    const dataPointString = dataPoint.toString();
    if (
      dataPointString.includes('.') &&
      dataPointString.split('.')[1].length > 2
    ) {
      return dataPoint.toFixed(2);
    }
    return dataPointString;
  }
  return 'Loading...';
};

const DataTable: React.FC<DataTableProps> = ({
  columnHeaders,
  rowHeaders,
  data,
  showCareProvider,
  careProviderMedianMetrics,
}) => {
  return (
    <table className="govuk-table">
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
        {Object.entries(rowHeaders).map(([key, value]) => (
          <tr key={key}>
            <td className="govuk-table__cell govuk-table__cell--header">
              {value}
            </td>
            {showCareProvider && (
              <td className="govuk-table__cell">
                {getFormattedDataPoint(
                  data,
                  getCareProviderKey(key, careProviderMedianMetrics),
                  'Care provider location'
                )}
              </td>
            )}
            <td className="govuk-table__cell">
              {getFormattedDataPoint(data, key, 'LA')}
            </td>
            <td className="govuk-table__cell">
              {getFormattedDataPoint(data, key, 'Regional')}
            </td>
            <td className="govuk-table__cell">
              {getFormattedDataPoint(data, key, 'National')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
