'use client';
import React, { useRef } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import NhsPeerGroupDetails from '@/components/data-components/NhsPeerGroupDetails';
import DataTable from '@/components/tables/table';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import { Indicator } from '@/data/interfaces/Indicator';
import { METRICS, MetricId } from '@/config/metrics';
import { chartLocationValues } from '@/helpers/locationComparison';

type Props = {
  // Tab ids within the page, e.g. "1" for chart-1, table-1 and download-1
  id: string;
  title: string;
  metric: MetricId;
  // The "Find out how ... is calculated" text above the tabs
  intro: React.ReactNode;
  // Defaults to the metric itself
  sharingMetricIds?: string[];
  figureNumber: number;
  metricDescription: string;
  // Defaults to the metric's label
  figureTitle?: string;
  dateLabel?: string;
  tableCaption: React.ReactNode;
  columnHeaders: Object;
  download: { filename: string; description: string };
  // The page's metric data, with the comparator average merged in
  data: Indicator[];
  laCode: string;
  laName: string;
  regionLabel: string;
  comparator: ComparatorControls;
  peer: {
    dataByMetric: Record<string, PeerGroupData | null>;
    loading: boolean;
    error: boolean;
  };
  // Shown beside the comparison group on the chart, e.g. a breakdown select
  chartControl?: React.ReactNode;
};

/**
 * One metric compared with the user's region, England and a comparison group:
 * a peer group chart, a table of the areas and a CSV download (GASCD-354).
 */
const MetricSection: React.FC<Props> = ({
  id,
  title,
  metric,
  intro,
  sharingMetricIds,
  figureNumber,
  metricDescription,
  figureTitle,
  dateLabel,
  tableCaption,
  columnHeaders,
  download,
  data,
  laCode,
  laName,
  regionLabel,
  comparator,
  peer,
  chartControl,
}) => {
  const tableref = useRef<HTMLTableElement>(null);

  return (
    <DataBox
      dataTitle={title}
      dataInfo={
        <>
          {intro}
          <NhsPeerGroupDetails />
        </>
      }
    >
      <DataTabs
        id={id}
        sharingMetricIds={sharingMetricIds ?? [metric]}
        table={
          <>
            {comparator.renderComparatorControl(`comparator-table-${id}`)}
            <DataTable
              metrics={[metric]}
              tableref={tableref}
              caption={tableCaption}
              columnHeaders={columnHeaders}
              data={data}
              showCareProvider={false}
            ></DataTable>
          </>
        }
        download={
          <>
            <div className="govuk-!-margin-bottom-4">
              {comparator.renderComparatorControl(`comparator-download-${id}`)}
            </div>
            <DownloadTableDataCSVLink
              tableref={tableref}
              filename={download.filename}
              xLabel=""
              downloadType={download.description}
            />
          </>
        }
        chart={
          <PeerGroupBarChart
            laCode={laCode}
            laName={laName}
            metric={metric}
            {...chartLocationValues(data, metric)}
            regionalAverageLabel={`${regionLabel} (regional average)`}
            peerData={peer.dataByMetric[metric] ?? null}
            loading={peer.loading}
            error={peer.error}
            comparatorControl={comparator.renderComparatorControl(
              `comparator-chart-${id}`,
              chartControl
            )}
            comparatorLabel={comparator.comparatorLabel}
            comparatorAverageLabel={comparator.comparatorAverageLabel}
            metricDescription={metricDescription}
            figureTitle={figureTitle ?? METRICS[metric].label}
            dateLabel={dateLabel}
            figureNumber={figureNumber}
          />
        }
      />
    </DataBox>
  );
};

export default MetricSection;
