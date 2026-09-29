import React, { Ref } from 'react';
import TableService from '@/services/Table/TableService';
import { getPeerChartRows } from '@/components/charts/peer-group/peerChartRows';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { PeerGroupData } from '@/components/charts/peer-group/types';

type ValueFormat = 'number' | 'percentage' | 'currency';

type PeerGroupTableProps = {
  caption?: React.ReactNode;
  source: string;
  valueHeader: string;
  laCode: string;
  laName: string;
  currentLaValue: number | null;
  peerData: PeerGroupData | null;
  loading: boolean;
  error: boolean;
  comparatorAverageLabel?: string;
  regionalAverageLabel?: string;
  regionalAverageValue: number | null;
  nationalAverageLabel?: string;
  nationalAverageValue: number | null;
  valueFormat?: ValueFormat;
  // Shown above the chart's rows, e.g. the user's own care home
  extraRows?: { label: string; value: number | null }[];
  tableref?: Ref<HTMLTableElement>;
  children?: React.ReactNode;
};

// The rows of the peer group chart beside it: the user's LA and each peer in
// the chart's order, then the comparator, regional and national averages.
// Not sortable, so the order always matches the chart.
const PeerGroupTable: React.FC<PeerGroupTableProps> = ({
  caption,
  source,
  valueHeader,
  laCode,
  laName,
  currentLaValue,
  peerData,
  loading,
  error,
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
  if (loading) return <p className="govuk-body">Loading...</p>;
  if (error || !peerData || currentLaValue === null) {
    return <p className="govuk-body">Data not available</p>;
  }

  const formatValue = (value: number | null) =>
    value === null
      ? 'N/A'
      : TableService.formatDataPoint(value, {
          isPercentage: valueFormat === 'percentage',
          isCurrency: valueFormat === 'currency',
        });

  const rows = [
    ...extraRows.map((row) => ({ ...row, bold: true })),
    ...getPeerChartRows(laName, currentLaValue, peerData, laCode).map(
      (row) => ({
        label: row.name,
        value: row.value,
        bold: row.name === laName,
      })
    ),
    {
      label: comparatorAverageLabel,
      value: peerData.averagePeerGroup,
      bold: true,
    },
    { label: regionalAverageLabel, value: regionalAverageValue, bold: true },
    { label: nationalAverageLabel, value: nationalAverageValue, bold: true },
  ];

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
              <th
                scope="col"
                className="govuk-table__header scrollable-table__header"
              >
                Area
              </th>
              <th
                scope="col"
                className="govuk-table__header govuk-table__cell--numeric scrollable-table__header"
              >
                {valueHeader}
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {rows.map((row) => (
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
      {children}
      <p className="govuk-body">Source: {source}</p>
    </div>
  );
};

export default PeerGroupTable;
