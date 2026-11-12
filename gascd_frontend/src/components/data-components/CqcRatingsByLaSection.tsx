'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import NhsPeerGroupDetails from '@/components/data-components/NhsPeerGroupDetails';
import PeerGroupTable from '@/components/tables/PeerGroupTable';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import SearchableCheckboxFilter from '@/components/filters/SearchableCheckboxFilter';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { NHS_PEER_GROUP_TOTAL_LABEL } from '@/components/charts/peer-group/constants';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import TableService from '@/services/Table/TableService';
import { Indicator } from '@/data/interfaces/Indicator';
import { withBasePath } from '@/lib/basePath';
import { CQC_RATINGS, METRICS } from '@/config/metrics';
import {
  ALL_CQC_SERVICE_TYPES,
  CQC_BENCHMARK_RATINGS,
  CQC_RATING_METRIC_IDS,
  CQC_SERVICE_TYPES,
  CQC_SERVICE_TYPE_OPTIONS,
  CqcRatingId,
  CqcServiceTypeId,
  DEFAULT_CQC_BENCHMARK_RATING,
  NUM_CQC_INSPECTED_LOCATIONS,
  cqcInspectedCountMetricId,
  cqcRatingCountMetricId,
  percCqcRatingMetricId,
} from '@/data/cqcMetrics';
import {
  shareBenchmark,
  shareOfTotal,
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
};

const NATIONAL_LABEL = 'England (national)';
const NHS_PEER_GROUP_SELECTION: ComparatorSelection = {
  kind: 'nhs_peer_group',
};

// "a", "a and b" or "a, b and c"
const listed = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : (items[0] ?? '');

/**
 * The percentage of inspected adult social care locations with a chosen CQC
 * rating, for the user's LA beside each LA in their comparison group, the
 * group, their region and England (GASCD-391): a table, the peer group bar chart
 * and a CSV download, filtered by rating and by service type.
 *
 * The rating and service types are chosen once for the section and the
 * controls are repeated in each tab, as the comparison group's is.
 */
const CqcRatingsByLaSection: React.FC<Props> = ({
  id,
  figureNumber,
  laCode,
  laName,
  regionLabel,
  comparator,
}) => {
  const tableref = useRef<HTMLTableElement>(null);
  const [rating, setRating] = useState<CqcRatingId>(
    DEFAULT_CQC_BENCHMARK_RATING
  );
  // The applied service types; none means all service types
  const [serviceTypes, setServiceTypes] = useState<CqcServiceTypeId[]>([]);
  // The user's LA, region and England values for the metrics selected
  const [baseData, setBaseData] = useState<Indicator[]>([]);
  const [baseStatus, setBaseStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  // A percentage across several service types is their counts summed over
  // their inspected locations summed, so the counts are what is fetched
  const { countMetricIds, inspectedMetricIds, metricIds } = useMemo(() => {
    const types: CqcServiceTypeId[] = serviceTypes.length
      ? serviceTypes
      : [ALL_CQC_SERVICE_TYPES];
    const counts: string[] = types.map((serviceType) =>
      cqcRatingCountMetricId(rating, serviceType)
    );
    const inspected: string[] = types.map((serviceType) =>
      cqcInspectedCountMetricId(serviceType)
    );
    return {
      countMetricIds: counts,
      inspectedMetricIds: inspected,
      metricIds: [...counts, ...inspected],
    };
  }, [rating, serviceTypes]);

  const peer = usePeerGroupData(
    laCode,
    metricIds,
    comparator.selection,
    comparator.groups
  );

  // The region's chart keeps the NHS peer group's line, as the other peer
  // group charts do, so its counts are fetched when the region is selected
  const nhsPeer = usePeerGroupData(
    comparator.comparatorIsRegion ? laCode : undefined,
    metricIds,
    NHS_PEER_GROUP_SELECTION,
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
        console.error('Error fetching CQC ratings by LA:', error);
        setBaseData([]);
        setBaseStatus('error');
      }
    };
    fetchBaseData();
    return () => {
      cancelled = true;
    };
  }, [laCode, metricIds]);

  // While a new selection is loading the previous one's rows are still held,
  // so only rows for the metrics now selected are read
  const share = (locationType: string) =>
    shareOfTotal(
      sumForLocationType(baseData, countMetricIds, locationType),
      sumForLocationType(baseData, inspectedMetricIds, locationType)
    );
  const laValue = share('LA');
  const laCount = sumForLocationType(baseData, countMetricIds, 'LA');
  const regionalValue = share('Regional');
  const nationalValue = share('National');

  const benchmark = useMemo(
    () =>
      shareBenchmark(
        peer.dataByMetric,
        countMetricIds,
        inspectedMetricIds,
        laCode
      ),
    [peer.dataByMetric, countMetricIds, inspectedMetricIds, laCode]
  );
  const peerData = useMemo(
    () =>
      benchmark.peerData && comparator.comparatorIsRegion
        ? {
            ...benchmark.peerData,
            nhsPeerGroupAverage:
              shareBenchmark(
                nhsPeer.dataByMetric,
                countMetricIds,
                inspectedMetricIds,
                laCode
              ).peerData?.averagePeerGroup ?? null,
          }
        : benchmark.peerData,
    [
      benchmark.peerData,
      comparator.comparatorIsRegion,
      nhsPeer.dataByMetric,
      countMetricIds,
      inspectedMetricIds,
      laCode,
    ]
  );
  const barDetails = Object.fromEntries(
    Object.entries({
      ...benchmark.countsByName,
      ...(laCount !== null ? { [laName]: laCount } : {}),
    }).map(([name, count]) => [name, TableService.formatDataPoint(count)])
  );

  const loading = peer.loading || nhsPeer.loading || baseStatus === 'loading';
  const error = peer.error || baseStatus === 'error';

  const ratingLabel = CQC_RATINGS[rating];
  const serviceTypesText = serviceTypes.length
    ? listed(
        serviceTypes.map((serviceType) =>
          CQC_SERVICE_TYPES[serviceType].toLowerCase()
        )
      )
    : CQC_SERVICE_TYPES[ALL_CQC_SERVICE_TYPES].toLowerCase();
  const date = IndicatorService.getMostRecentDate(baseData, metricIds);
  const title = `percentage of inspected adult social care locations rated ${ratingLabel}`;
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
  const metric = percCqcRatingMetricId(rating);

  const unavailableNote = benchmark.unavailableNames.length > 0 && (
    <p className="govuk-body">
      N/A means a local authority has no inspected locations for the selected
      service types. It is not included in the percentage for the comparison
      group.
    </p>
  );

  const controls = (tab: string) => (
    <>
      {comparator.renderComparatorControl(`comparator-${tab}-${id}`)}
      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-!-font-weight-bold"
          htmlFor={`cqc-rating-${tab}-${id}`}
        >
          CQC rating
        </label>
        <select
          className="govuk-select"
          id={`cqc-rating-${tab}-${id}`}
          value={rating}
          onChange={(e) => setRating(e.target.value as CqcRatingId)}
        >
          {CQC_BENCHMARK_RATINGS.map((option) => (
            <option key={option} value={option}>
              {CQC_RATINGS[option]}
            </option>
          ))}
        </select>
      </div>
      <SearchableCheckboxFilter
        idPrefix={`service-type-${tab}-${id}`}
        label="Service type"
        allLabel={CQC_SERVICE_TYPES[ALL_CQC_SERVICE_TYPES]}
        options={CQC_SERVICE_TYPE_OPTIONS}
        applied={serviceTypes}
        onApply={(values) => setServiceTypes(values as CqcServiceTypeId[])}
        noMatchesText="No service types match your search"
        analyticsId="cqc-ratings-service-type"
      />
    </>
  );

  return (
    <DataBox
      dataTitle="CQC ratings of inspected adult social care locations by local authority"
      dataInfo={
        <>
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(METRICS[NUM_CQC_INSPECTED_LOCATIONS].helpUrl)}
              className="govuk-link"
            >
              how the number and percentage of inspected adult social care
              locations by CQC rating are calculated
            </a>
            .
          </p>
          <NhsPeerGroupDetails />
        </>
      }
    >
      <DataTabs
        id={id}
        sharingMetricIds={CQC_RATING_METRIC_IDS}
        table={
          <>
            {controls('table')}
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
              valueHeader={`Percentage rated ${ratingLabel.toLowerCase()}`}
              laCode={laCode ?? ''}
              laName={laName}
              currentLaValue={laValue}
              peerData={peerData}
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
              peerData={peerData}
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
            {benchmark.unavailableNames.length > 0 && (
              <p className="govuk-body">
                Not shown: {listed(benchmark.unavailableNames)}. A local
                authority is not shown where it has no inspected locations for
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
              filename="cqc_ratings_of_inspected_adult_social_care_locations_by_local_authority.csv"
              xLabel=""
              downloadType="CQC ratings of inspected adult social care locations by local authority"
              notes={[
                `Percentage of inspected adult social care locations rated ${ratingLabel}`,
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
