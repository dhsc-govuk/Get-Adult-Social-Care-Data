import React, { Ref, useState } from 'react';
import TableService from '@/services/Table/TableService';
import { getPeerChartRows } from '@/components/charts/peer-group/peerChartRows';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { PeerGroupData } from '@/components/charts/peer-group/types';

type ValueFormat = 'number' | 'percentage' | 'currency';
type SortColumn = 'area' | 'value';
type SortDirection = 'ascending' | 'descending';

type PeerGroupTableProps = {
  caption?: React.ReactNode;
  source: string;
  valueHeader: string;
  laCode: string;
  laName: string;
  currentLaValue: number | null;
  peerData: PeerGroupData | null;
  loading: boolean;
  comparatorAverageLabel?: string;
  regionalAverageLabel?: string;
  regionalAverageValue: number | null;
  nationalAverageLabel?: string;
  nationalAverageValue: number | null;
  valueFormat?: ValueFormat;
  extraRows?: { label: string; value: number | null }[];
  tableref?: Ref<HTMLTableElement>;
  children?: React.ReactNode;
};

const SORT_ICONS: Record<SortDirection | 'none', string> = {
  ascending: 'M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z',
  descending: 'M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z',
  none: 'M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z',
};

// Sorted in React: the MOJ script reorders the DOM, which breaks when rows change
const PeerGroupTable: React.FC<PeerGroupTableProps> = ({
  caption,
  source,
  valueHeader,
  laCode,
  laName,
  currentLaValue,
  peerData,
  loading,
  comparatorAverageLabel = NHS_PEER_GROUP_AVERAGE_LABEL,
  regionalAverageLabel = 'England (regional average)',
  regionalAverageValue,
  nationalAverageLabel = 'England (national average)',
  nationalAverageValue,
  valueFormat = 'number',
  extraRows = [],
  tableref,
  children,
}) => {
  const [sort, setSort] = useState<{
    column: SortColumn;
    direction: SortDirection;
  }>({ column: 'value', direction: 'descending' });

  const formatValue = (value: number | null) => {
    if (value === null) return loading ? 'Loading...' : 'N/A';
    return TableService.formatDataPoint(value, {
      isPercentage: valueFormat === 'percentage',
      isCurrency: valueFormat === 'currency',
    });
  };

  // Always rendered, as the download reads it, so the LA row stands in for peers
  const chartRows =
    peerData && currentLaValue !== null
      ? getPeerChartRows(laName, currentLaValue, peerData, laCode).map(
          (row) => ({
            label: row.name,
            value: row.value as number | null,
            bold: row.name === laName,
          })
        )
      : [{ label: laName, value: currentLaValue, bold: true }];

  const rows = [
    ...extraRows.map((row) => ({ ...row, bold: true })),
    ...chartRows,
    {
      label: comparatorAverageLabel,
      value: peerData?.averagePeerGroup ?? null,
      bold: true,
    },
    { label: regionalAverageLabel, value: regionalAverageValue, bold: true },
    { label: nationalAverageLabel, value: nationalAverageValue, bold: true },
  ];

  const sign = sort.direction === 'ascending' ? 1 : -1;
  const sortedRows = [...rows].sort((a, b) => {
    if (sort.column === 'area') return sign * a.label.localeCompare(b.label);
    if (a.value === null) return b.value === null ? 0 : 1;
    if (b.value === null) return -1;
    return sign * (a.value - b.value);
  });

  const sortBy = (column: SortColumn) =>
    setSort((current) =>
      current.column === column
        ? {
            column,
            direction:
              current.direction === 'ascending' ? 'descending' : 'ascending',
          }
        : { column, direction: column === 'area' ? 'ascending' : 'descending' }
    );

  const heading = (column: SortColumn, label: string, className: string) => {
    const direction = sort.column === column ? sort.direction : 'none';
    return (
      <th scope="col" className={className} aria-sort={direction}>
        <button type="button" onClick={() => sortBy(column)}>
          {label}
          <svg
            width="22"
            height="22"
            focusable="false"
            aria-hidden="true"
            role="img"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={SORT_ICONS[direction]} fill="currentColor" />
          </svg>
        </button>
      </th>
    );
  };

  return (
    <div>
      <div className="moj-scrollable-pane" role="region">
        <table className="govuk-table" ref={tableref}>
          {caption && (
            <caption className="govuk-table__caption govuk-table__caption--s">
              {caption}
              <span className="govuk-visually-hidden">
                {' '}
                (column headers with buttons are sortable).
              </span>
            </caption>
          )}
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              {heading(
                'area',
                'Area',
                'govuk-table__header scrollable-table__header'
              )}
              {heading(
                'value',
                valueHeader,
                'govuk-table__header govuk-table__cell--numeric scrollable-table__header'
              )}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {sortedRows.map((row) => (
              <tr key={row.label} className="govuk-table__row">
                <th
                  scope="row"
                  className="govuk-table__cell govuk-!-font-weight-regular"
                >
                  {row.bold ? <strong>{row.label}</strong> : row.label}
                </th>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {formatValue(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="govuk-visually-hidden" role="status" aria-live="polite">
        Sort by {sort.column === 'area' ? 'Area' : valueHeader} (
        {sort.direction})
      </div>
      {children}
      <p className="govuk-body">Source: {source}</p>
    </div>
  );
};

export default PeerGroupTable;
