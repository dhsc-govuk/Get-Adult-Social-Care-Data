import React, { useRef } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';
import { MetaData } from '@/data/interfaces/MetaData';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import PresentDemandService from '@/services/present-demand/presentDemandService';

type DataTableProps = {
  caption?: string;
  columnHeaders: string[];
  rowHeaders: Object;
  data: Indicator[];
  showCareProvider: boolean;
  careProviderMedianMetrics?: Record<string, string>;
  percentageRows?: MetaData[];
  source?: string;
  last_updated?: string;
  csv_download?: boolean;
  children?: React.ReactNode;
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
  isPercentage: boolean = false
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
    let formattedDataPoint = Number(foundMetric.data_point).toLocaleString();
    return isPercentage ? `${formattedDataPoint}%` : formattedDataPoint;
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
  csv_download = true,
  children,
  source,
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
          <caption className="govuk-table__caption govuk-table__caption--s govuk-!-margin-top-7">
            {caption}
          </caption>
        )}
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            {columnHeaders.map((columnHeader, columnIndex) => (
              <th
                key={columnIndex}
                scope="col"
                className={columnClass(columnIndex)}
              >
                {columnHeader}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {Object.entries(rowHeaders).map(([key, value]) => (
            <tr key={key}>
              <th
                scope="row"
                className="govuk-table__cell govuk-table__cell--header"
              >
                {value}
              </th>
              {showCareProvider && (
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {getFormattedDataPoint(
                    data,
                    getCareProviderKey(key, careProviderMedianMetrics),
                    'Care provider location',
                    percentageRows?.some((item) => item.metric_id === key) ??
                      false
                  )}
                </td>
              )}
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'LA',
                  percentageRows?.some((item) => item.metric_id === key) ??
                    false
                )}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'Regional',
                  percentageRows?.some((item) => item.metric_id === key) ??
                    false
                )}
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {getFormattedDataPoint(
                  data,
                  key,
                  'National',
                  percentageRows?.some((item) => item.metric_id === key) ??
                    false
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
      {csv_download && (
        <p className="govuk-body">
          <DownloadTableDataCSVLink tableref={tableref} xLabel="" />
        </p>
      )}
      <p className="govuk-body">
        {source}
        <br />
        {data.length > 0 && (
          <span>
            Data correct as of{' '}
            {PresentDemandService.getMostRecentDate(
              data,
              Object.keys(rowHeaders)
            )}
          </span>
        )}
      </p>
    </div>
  );
};

export default DataTable;
