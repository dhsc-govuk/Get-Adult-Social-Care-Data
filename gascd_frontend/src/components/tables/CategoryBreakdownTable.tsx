import React, { Ref } from 'react';
import { Indicator } from '@/data/interfaces/Indicator';
import TableService from '@/services/Table/TableService';
import { COMPARATOR_AVERAGE_LOCATION_TYPE } from '@/components/charts/peer-group/constants';
import { METRICS, MetricId } from '@/config/metrics';
import { BreakdownCategory, breakdownValue } from '@/helpers/categoryBreakdown';

type ColumnHeaders = Record<string, string | null | undefined>;

type CategoryBreakdownTableProps = {
  caption?: React.ReactNode;
  // As DataTable: LALabel, ComparatorLabel (or RegionLabel) and CountryLabel
  columnHeaders: Object;
  // The heading of the first column, e.g. "CQC rating"
  categoryColumnName: string;
  // One row per category, each showing "count (percentage)"
  categories: BreakdownCategory[];
  // The final row, showing the count the percentages are of
  total: { label: string; metric: MetricId };
  data: Indicator[];
  // Defaults to the metrics' shared source
  source?: string;
  tableref?: Ref<HTMLTableElement>;
  children?: React.ReactNode;
};

/**
 * A table of a whole split into categories, each row showing the count and the
 * percentage it is of the total, with the total as the last row. Built to the
 * same shape as `DataTable`: the compared locations are the columns, and the
 * comparator column takes the place of the region when a comparison group is
 * chosen. Each row carries the colour its segment has in the matching
 * `StackedBarChart`.
 */
const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = ({
  caption,
  columnHeaders,
  categoryColumnName,
  categories,
  total,
  data,
  source = METRICS[total.metric].source,
  tableref = undefined,
  children,
}) => {
  const headers = columnHeaders as ColumnHeaders;
  const hasHeader = (key: string) =>
    headers[key] !== undefined && headers[key] !== null && headers[key] !== '';
  const showComparatorAverage = hasHeader('ComparatorLabel');

  const columns = [
    { key: 'LALabel', locationType: 'LA' },
    showComparatorAverage
      ? {
          key: 'ComparatorLabel',
          locationType: COMPARATOR_AVERAGE_LOCATION_TYPE,
        }
      : { key: 'RegionLabel', locationType: 'Regional' },
    { key: 'CountryLabel', locationType: 'National' },
  ].filter((column) => hasHeader(column.key));

  const columnClass = (columnIndex: number) => {
    if (columnIndex === 0) {
      return 'govuk-table__header govuk-!-width-one-third scrollable-table__header';
    } else {
      return 'govuk-table__header govuk-table__cell--numeric scrollable-table__header';
    }
  };

  // As DataTable: a missing value reads as unavailable once any data has
  // arrived, and as loading before then
  const missingValue = () => (data.length ? '--' : 'Loading...');

  const formatCount = (locationType: string, metric: MetricId): string => {
    const count = breakdownValue(data, metric, locationType);
    return count !== null
      ? TableService.formatDataPoint(count)
      : missingValue();
  };

  // "count (percentage)", or just the count where the percentage is missing
  const formatCell = (
    locationType: string,
    category: BreakdownCategory
  ): string => {
    const count = breakdownValue(data, category.countMetric, locationType);
    if (count === null) return missingValue();
    const percentage = breakdownValue(
      data,
      category.percentageMetric,
      locationType
    );
    const formattedCount = TableService.formatDataPoint(count);
    return percentage !== null
      ? `${formattedCount} (${TableService.formatDataPoint(percentage, { isPercentage: true })})`
      : formattedCount;
  };

  return (
    <div>
      <div
        className="moj-scrollable-pane dhsc-scrollable-pane--auto"
        role="region"
      >
        <table className="govuk-table" ref={tableref}>
          {caption && (
            <caption className="govuk-table__caption govuk-table__caption--s">
              {caption}
            </caption>
          )}
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th key="0" scope="col" className={columnClass(0)}>
                {categoryColumnName}
              </th>
              {columns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  scope="col"
                  className={columnClass(columnIndex + 1)}
                >
                  {headers[column.key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {categories.map((category) => (
              <tr key={category.countMetric} className="govuk-table__row">
                <th
                  scope="row"
                  className="govuk-table__cell govuk-!-font-weight-regular scrollable-table__header"
                >
                  <span
                    className="dhsc-category-key"
                    style={{ backgroundColor: category.colour }}
                    aria-hidden="true"
                  />
                  {category.label}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="govuk-table__cell govuk-table__cell--numeric"
                  >
                    {formatCell(column.locationType, category)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="govuk-table__row dhsc-table__row--total">
              <th
                scope="row"
                className="govuk-table__cell govuk-!-font-weight-bold scrollable-table__header"
              >
                {total.label}
              </th>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold"
                >
                  {formatCount(column.locationType, total.metric)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {children}
      <p className="govuk-body govuk-!-margin-bottom-0">Source: {source}</p>
    </div>
  );
};

export default CategoryBreakdownTable;
