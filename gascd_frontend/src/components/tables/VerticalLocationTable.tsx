import React, { Ref, useEffect } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';

type VerticalLocationTableProps = {
  caption?: React.ReactNode;
  columnHeaders: Object;
  rowHeaders: Object;
  data: Indicator[];
  percentageColumns?: string[];
  source?: string;
  last_updated?: string;
  children?: React.ReactNode;
  showAverageLabel?: boolean;
  tableref?: Ref<HTMLTableElement>;
  userLa: string;
};

const VerticalLocationTable: React.FC<VerticalLocationTableProps> = ({
  caption,
  columnHeaders,
  rowHeaders,
  data,
  children,
  source,
  tableref = undefined,
  userLa,
}) => {
  useEffect(() => {
    const sortTables = async () => {
      // Import this at page load time to avoid NextJS SSR errors
      // https://nextjs.org/docs/app/guides/lazy-loading#loading-external-libraries
      const MOJFrontend = await import('@ministryofjustice/frontend');

      const $sortableTables = document.querySelectorAll(
        '[data-module="moj-sortable-table"]'
      );

      $sortableTables.forEach(($sortableTable) => {
        new MOJFrontend.SortableTable($sortableTable);
      });
    };
    sortTables();
  }, []);

  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header scrollable-table__header';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric  scrollable-table__header';
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

  const getFormattedLocationLabel = (location: string, index: number): any => {
    if (index === 0) {
      return <strong>{location}</strong>;
    } else if (index === 1) {
      return <strong>{location}</strong>;
    } else if (location === userLa) {
      return <strong>{location}</strong>;
    }

    return location;
  };

  return (
    <div>
      <div className="moj-scrollable-pane" role="region">
        <table
          className="govuk-table"
          ref={tableref}
          data-module="moj-sortable-table"
        >
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
                    aria-sort="none"
                  >
                    {columnLabel}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {Object.entries(rowHeaders).map(([key, value], index) => (
              <tr key={key}>
                <th
                  scope="row"
                  className="govuk-table__cell govuk-!-font-weight-regular"
                >
                  {getFormattedLocationLabel(value, index)}
                </th>
                <td
                  className="govuk-table__cell govuk-table__cell--numeric"
                  data-sort-value={
                    data.find((metric) => metric.location_id === key)
                      ?.data_point || 0
                  }
                >
                  {getFormattedDataPoint(data, key)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children}
      <p className="govuk-body">Source: {source}</p>
    </div>
  );
};

export default VerticalLocationTable;
