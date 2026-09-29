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
  const formatValue = (value: number | null) => {
    if (value === null) return loading ? 'Loading...' : 'N/A';
    return TableService.formatDataPoint(value, {
      isPercentage: valueFormat === 'percentage',
      isCurrency: valueFormat === 'currency',
    });
  };

  // Always rendered, like the other tables (the download reads it); until the
  // peers load, or if they fail, the LA still gets its row
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
