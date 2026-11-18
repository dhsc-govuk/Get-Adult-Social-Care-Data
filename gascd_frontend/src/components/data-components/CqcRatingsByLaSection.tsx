'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import NhsPeerGroupDetails from '@/components/data-components/NhsPeerGroupDetails';
import SectionControls from '@/components/data-components/SectionControls';
import PeerGroupTable from '@/components/tables/PeerGroupTable';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import FilterPanel from '@/components/filters/FilterPanel';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { NHS_PEER_GROUP_TOTAL_LABEL } from '@/components/charts/peer-group/constants';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import TableService from '@/services/Table/TableService';
import { Indicator } from '@/data/interfaces/Indicator';
import { withBasePath } from '@/lib/basePath';
import { METRICS } from '@/config/metrics';
import {
  ALL_CQC_SERVICE_TYPES,
  CQC_RATING_BENCHMARK,
  CQC_SERVICE_TYPES,
  CQC_SERVICE_TYPE_FILTER_GROUP,
  CqcBenchmark,
  CqcServiceTypeId,
} from '@/data/cqcMetrics';
import { shareOfTotal } from '@/helpers/categoryBreakdown';
import {
  benchmarkFailed,
  shareBenchmark,
  sumForLocationType,
} from '@/helpers/ratingBenchmark';

type Props = {
  // Tab ids within the page, e.g. "2" for table-2, chart-2 and download-2
  id: string;
  // The number of both the table and the figure
  figureNumber: number;
  // Undefined until the user's locations have resolved
  laCode: string | undefined;
  laName: string;
  regionLabel: string;
  // The page's comparison group, shared with its other sections
  comparator: ComparatorControls;
  // What the LAs are compared on. Defaults to the CQC ratings
  benchmark?: CqcBenchmark;
};

const NATIONAL_LABEL = 'England (national)';

// "a", "a and b" or "a, b and c"
const listed = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : (items[0] ?? '');

/**
 * The percentage of inspected adult social care locations with a chosen CQC
 * rating (GASCD-391), or of all locations with a chosen inspection status
 * (GASCD-394), for the user's LA beside each LA in their comparison group, the
 * group, their region and England: a table, the peer group bar chart and a CSV
 * download, filtered by the option chosen and by service type.
 *
 * The option and service types are chosen once for the section and the
 * controls are repeated in each tab, as the comparison group's is.
 */
const CqcRatingsByLaSection: React.FC<Props> = ({
  id,
  figureNumber,
  laCode,
  laName,
  regionLabel,
  comparator,
  benchmark = CQC_RATING_BENCHMARK,
}) => {
  const tableref = useRef<HTMLTableElement>(null);
  const [optionValue, setOptionValue] = useState(benchmark.defaultValue);
  const option =
    benchmark.options.find(({ value }) => value === optionValue) ??
    benchmark.options[0];
  // The applied service types; none means all service types
  const [serviceTypes, setServiceTypes] = useState<CqcServiceTypeId[]>([]);
  // The user's LA, region and England values for the metrics selected
  const [baseData, setBaseData] = useState<Indicator[]>([]);
  const [baseStatus, setBaseStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  // A percentage across several service types is their counts summed over
  // their totals summed, so the counts are what is fetched
  const { countMetricIds, totalMetricIds, metricIds } = useMemo(() => {
    const types: CqcServiceTypeId[] = serviceTypes.length
      ? serviceTypes
      : [ALL_CQC_SERVICE_TYPES];
    const counts = types.map(option.countMetricId);
    const totals = types.map(benchmark.totalMetricId);
    return {
      countMetricIds: counts,
      totalMetricIds: totals,
      metricIds: [...counts, ...totals],
    };
  }, [option, benchmark, serviceTypes]);

  const peer = usePeerGroupData(
    laCode,
    metricIds,
    comparator.selection,
    comparator.groups
  );

  useEffect(() => {
    if (!laCode) return;
    let cancelled = false;
    const fetchBaseData = async () => {
      setBaseStatus('loading');
      try {
        const data = await IndicatorFetchService.getData({
          metric_ids: metricIds,
          location_ids: [],
        });
        if (cancelled) return;
        setBaseData(TableService.filterDate(data));
        setBaseStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error(`Error fetching ${benchmark.sectionTitle}:`, error);
        setBaseData([]);
        setBaseStatus('error');
      }
    };
    fetchBaseData();
    return () => {
      cancelled = true;
    };
  }, [laCode, metricIds, benchmark.sectionTitle]);

  // While a new selection is loading the previous one's rows are still held,
  // so only rows for the metrics now selected are read
  const share = (locationType: string) =>
    shareOfTotal(
      sumForLocationType(baseData, countMetricIds, locationType),
      sumForLocationType(baseData, totalMetricIds, locationType)
    );
  const laValue = share('LA');
  const laCount = sumForLocationType(baseData, countMetricIds, 'LA');
  const regionalValue = share('Regional');
  const nationalValue = share('National');

  const shares = useMemo(
    () =>
      shareBenchmark(peer.dataByMetric, countMetricIds, totalMetricIds, laCode),
    [peer.dataByMetric, countMetricIds, totalMetricIds, laCode]
  );
  const barDetails = Object.fromEntries(
    Object.entries({
      ...shares.countsByName,
      ...(laCount !== null ? { [laName]: laCount } : {}),
    }).map(([name, count]) => [name, TableService.formatDataPoint(count)])
  );

  const loading = peer.loading || baseStatus === 'loading';
  // usePeerGroupData only reports an error when every metric fails, but the
  // percentages need every count, so one failed request is an error here
  const error =
    peer.error ||
    baseStatus === 'error' ||
    benchmarkFailed(peer.dataByMetric, metricIds);

  const serviceTypesText = serviceTypes.length
    ? listed(
        serviceTypes.map((serviceType) =>
          CQC_SERVICE_TYPES[serviceType].toLowerCase()
        )
      )
    : CQC_SERVICE_TYPES[ALL_CQC_SERVICE_TYPES].toLowerCase();
  const date = IndicatorService.getMostRecentDate(baseData, metricIds);
  const { title } = option;
  // Each area's figure is a percentage, so none is labelled as an average
  const regionalLabel = `${regionLabel} (regional)`;
  const selectedGroup =
    comparator.selection.kind === 'custom'
      ? comparator.groups.find(
          (group) =>
            comparator.selection.kind === 'custom' &&
            group.id === comparator.selection.groupId
        )
      : undefined;
  // The group shown beside the region and England: the NHS peer group where
  // the region itself is the comparison group
  const groupLabel =
    selectedGroup && !comparator.comparatorIsRegion
      ? selectedGroup.name
      : NHS_PEER_GROUP_TOTAL_LABEL;
  const comparedAreas = `${groupLabel}, ${regionalLabel} and ${NATIONAL_LABEL}, ${serviceTypesText}`;
  // The metric that sets the percentage format, the source and the sharing label
  const metric = option.percentageMetric;

  const unavailableNote = shares.unavailableNames.length > 0 && (
    <p className="govuk-body">
      N/A means a local authority has no {benchmark.totalDescription} for the
      selected service types. It is not included in the percentage for the
      comparison group.
    </p>
  );

  const controls = (tab: string) => (
    <SectionControls
      comparator={comparator.renderComparatorControl(`comparator-${tab}-${id}`)}
      extraControls={
        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-!-font-weight-bold"
            htmlFor={`cqc-benchmark-${tab}-${id}`}
          >
            {benchmark.selectLabel}
          </label>
          <select
            className="govuk-select"
            id={`cqc-benchmark-${tab}-${id}`}
            value={option.value}
            onChange={(e) => setOptionValue(e.target.value)}
          >
            {benchmark.options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      }
      filters={
        <FilterPanel
          idPrefix={`service-type-${tab}-${id}`}
          filterType={benchmark.analyticsId}
          groups={[CQC_SERVICE_TYPE_FILTER_GROUP]}
          applied={{ [CQC_SERVICE_TYPE_FILTER_GROUP.id]: serviceTypes }}
          onApply={(selection) =>
            setServiceTypes(
              selection[CQC_SERVICE_TYPE_FILTER_GROUP.id] as CqcServiceTypeId[]
            )
          }
        />
      }
    />
  );

  return (
    <DataBox
      dataTitle={benchmark.sectionTitle}
      dataInfo={
        <>
          <p className="govuk-body-m">
            Find out{' '}
            <a href={withBasePath(benchmark.helpUrl)} className="govuk-link">
              {benchmark.helpLinkText}
            </a>
            .
          </p>
          <NhsPeerGroupDetails />
        </>
      }
    >
      <DataTabs
        id={id}
        sharingMetricIds={benchmark.options.map(
          ({ percentageMetric }) => percentageMetric
        )}
        table={
          <>
            {controls('table')}
            {!loading && error && (
              <p className="govuk-body">Data not available</p>
            )}
            <PeerGroupTable
              tableref={tableref}
              caption={
                <>
                  Table {figureNumber}: {title} &ndash; {laName}{' '}
                  <abbr title="local authority">LA</abbr>, {comparedAreas}
                  {date ? `, ${date}` : ''}
                </>
              }
              metric={metric}
              valueHeader={option.valueHeader}
              laCode={laCode ?? ''}
              laName={laName}
              currentLaValue={laValue}
              peerData={shares.peerData}
              loading={loading}
              comparatorAverageLabel={groupLabel}
              comparatorIsRegion={comparator.comparatorIsRegion}
              regionalAverageLabel={regionalLabel}
              regionalAverageValue={regionalValue}
              nationalAverageLabel={NATIONAL_LABEL}
              nationalAverageValue={nationalValue}
              referenceRowsFirst
            >
              {unavailableNote}
            </PeerGroupTable>
          </>
        }
        chart={
          <>
            <PeerGroupBarChart
              laCode={laCode ?? ''}
              laName={laName}
              metric={metric}
              currentLaValue={laValue}
              nationalAverageValue={nationalValue}
              regionalAverageValue={regionalValue}
              peerData={shares.peerData}
              loading={loading}
              error={error}
              comparatorControl={controls('chart')}
              comparatorLabel={comparator.comparatorLabel}
              comparatorAverageLabel={groupLabel}
              nhsPeerGroupAverageLabel={groupLabel}
              comparatorIsRegion={comparator.comparatorIsRegion}
              regionalAverageLabel={regionalLabel}
              nationalAverageLabel={NATIONAL_LABEL}
              metricDescription={`the ${title}`}
              figureTitle={title}
              figureNumber={figureNumber}
              comparisonSummary={`${laName} LA, ${comparedAreas}`}
              dateLabel={date}
              barDetails={barDetails}
              xAxisRange={[0, 100]}
            />
            {shares.unavailableNames.length > 0 && (
              <p className="govuk-body">
                Not shown: {listed(shares.unavailableNames)}. A local authority
                is not shown where it has no {benchmark.totalDescription} for
                the selected service types, and it is not included in the
                percentage for the comparison group.
              </p>
            )}
          </>
        }
        download={
          <>
            {controls('download')}
            <DownloadTableDataCSVLink
              tableref={tableref}
              filename={`${benchmark.sectionTitle.toLowerCase().replaceAll(' ', '_')}.csv`}
              xLabel=""
              downloadType={benchmark.sectionTitle}
              notes={[
                title.charAt(0).toUpperCase() + title.slice(1),
                `Service types: ${serviceTypesText}`,
                ...(date ? [`Data date: ${date}`] : []),
                `Source: ${METRICS[metric].source}`,
              ]}
            />
          </>
        }
      />
    </DataBox>
  );
};

export default CqcRatingsByLaSection;
