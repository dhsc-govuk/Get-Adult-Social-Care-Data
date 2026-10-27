'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import LocationService from '@/services/location/locationService';
import DataTable from '@/components/tables/table';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import FilterCheckboxGroup from '@/components/filters/FilterCheckboxGroup';
import SectionControls from '@/components/data-components/SectionControls';
import FilterSelectGroup from '@/components/filters/FilterSelectGroup';
import { useFilterSync } from '@/components/filters/useFilterSync';
import PeerGroupTable from '@/components/tables/PeerGroupTable';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import MetricSection from '@/components/data-components/MetricSection';
import NhsPeerGroupDetails from '@/components/data-components/NhsPeerGroupDetails';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { METRICS, MetricId, metricLabels, SOURCES } from '@/config/metrics';
import { locationValues } from '@/helpers/locationComparison';

// In the order the tables and filters show them
const SUPPORT_REASON_ROWS: MetricId[] = [
  'learning_disability_support_18_and_over',
  'mental_health_support_18_and_over',
  'access_and_mobility_only_physical_support_18_and_over',
  'personal_care_support_physical_support_18_and_over',
  'support_for_dual_impairment_sensory_support_18_and_over',
  'support_for_hearing_impairment_sensory_support_18_and_over',
  'support_for_visual_impairment_sensory_support_18_and_over',
  'asylum_seeker_support_social_support_18_and_over',
  'substance_misuse_support_social_support_18_and_over',
  'support_for_social_isolation_other_social_support_18_and_over',
  'support_with_memory_and_cognition_18_and_over',
];

export default function DisabilityPrevalence() {
  const tableref4 = useRef<HTMLTableElement>(null);
  const tableref5 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationNamesWithAverageLabels, setLocationNamesWithAverageLabels] =
    useState<LocationNames>({
      CPLabel: 'Loading...',
      LALabel: 'Loading...',
      RegionLabel: 'Loading...',
      CountryLabel: 'Loading...',
    } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [filteredDisabilityData, setFilteredDisabilityData] = useState<
    Indicator[]
  >([]);
  const [primarySupportReasonData, setPrimarySupportReasonData] = useState<
    Indicator[]
  >([]);
  const [filteredPrimaryReasonData, setFilteredPrimaryReasonData] = useState<
    Indicator[]
  >([]);
  const [standardisedReasonData, setStandardisedReasonData] = useState<
    Indicator[]
  >([]);
  const [disabilityQuery, setDisabilityQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [supportReasonQuery, setSupportReasonQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  // Status of the metric-data request that supplies the user's LA and England
  // values for the benchmarked learning disability chart. Starts as loading
  // because the query cannot be built until the location ids resolve.
  const [baseDataStatus, setBaseDataStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/topics/population-needs/subtopics',
    },
  ];

  const supportReasonMetricIds = [
    'access_and_mobility_only_physical_support_18_and_over',
    'asylum_seeker_support_social_support_18_and_over',
    'learning_disability_support_18_and_over',
    'mental_health_support_18_and_over',
    'personal_care_support_physical_support_18_and_over',
    'substance_misuse_support_social_support_18_and_over',
    'support_for_dual_impairment_sensory_support_18_and_over',
    'support_for_hearing_impairment_sensory_support_18_and_over',
    'support_for_social_isolation_other_social_support_18_and_over',
    'support_for_visual_impairment_sensory_support_18_and_over',
    'support_with_memory_and_cognition_18_and_over',
  ];

  const disabilityMetricIds = [
    'perc_population_disability',
    'learning_disability_prevalence',
    'perc_general_health',
  ];

  // Metrics with peer group / custom comparator benchmarking. The primary
  // support reason table keeps its true regional values.
  const benchmarkedMetricIds = [
    'perc_general_health',
    'perc_population_disability',
    'learning_disability_prevalence',
  ];

  const toStandardisedId = (id: string) => `${id}_per100k_adults`;
  const standardisedSupportReasonMetricIds =
    supportReasonMetricIds.map(toStandardisedId);

  // The benchmarking figure takes a single primary support reason at a time.
  // The control and the figure read the same default so they cannot disagree.
  const DEFAULT_CHART_SUPPORT_REASON = toStandardisedId(
    'learning_disability_support_18_and_over'
  );
  const [chartSupportReason, setChartSupportReason] = useState<string>(
    DEFAULT_CHART_SUPPORT_REASON
  );

  const metricPage = 'disability-prevalence';
  const laCode = locationIds[1];

  const comparator = useComparatorControls({ laCode, metricPage });
  const {
    dataByMetric,
    loading: peerLoading,
    error: peerError,
  } = usePeerGroupData(
    laCode,
    [
      ...benchmarkedMetricIds,
      ...supportReasonMetricIds,
      ...standardisedSupportReasonMetricIds,
    ],
    comparator.selection,
    comparator.groups
  );
  // A chart needs both the comparator data and the user's own LA / England
  // values before it is complete, so it waits for (and fails on) either
  // request rather than rendering peer bars without the user's authority.
  const chartLoading = peerLoading || baseDataStatus === 'loading';
  const chartError = peerError || baseDataStatus === 'error';
  // Column headers for the benchmarked tables: true regional average + comparator
  const benchmarkedColumnHeaders = {
    CPLabel: locationNames.CPLabel,
    LALabel: locationNames.LALabel,
    RegionLabel: `${locationNames.RegionLabel} (regional average)`,
    ComparatorLabel: comparator.comparatorAverageLabel,
    CountryLabel: 'England (national average)',
  };

  // Shared explanatory note shown in every benchmarked data box
  const supportReasonRowHeadersDefault = metricLabels(SUPPORT_REASON_ROWS);
  const standardisedRowHeadersDefault: Record<string, string> =
    Object.fromEntries(
      Object.entries(supportReasonRowHeadersDefault).map(([id, label]) => [
        toStandardisedId(id),
        label,
      ])
    );

  const [supportReasonRowHeaders, setSupportReasonRowHeaders] = useState<any>(
    supportReasonRowHeadersDefault
  );

  useEffect(() => {
    const fetchSelectedLocation = async () => {
      const userLocationId = await LocationService.getSelectedLocation();
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      setCPLocationId(userLocationId);
    };
    fetchSelectedLocation();

    // Track all metrics on this page
    disabilityMetricIds.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
    supportReasonMetricIds.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
  }, []);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await LocationService.getLocationNames(
            CPLocationId,
            false
          );
          setLocationNames(locationNames);
          setLocationNamesWithAverageLabels({
            CPLabel: locationNames.CPLabel!,
            LALabel: locationNames.LALabel,
            RegionLabel: `${locationNames.RegionLabel} (regional average)`,
            CountryLabel: `${locationNames.CountryLabel} (national average)`,
          });
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setDisabilityQuery(() => ({
        metric_ids: disabilityMetricIds,
        location_ids: locationIds,
      }));
      setSupportReasonQuery(() => ({
        metric_ids: [
          ...supportReasonMetricIds,
          ...standardisedSupportReasonMetricIds,
        ],
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    let cancelled = false;
    const fetchDisabilityData = async () => {
      if (!CPLocationId || disabilityQuery.metric_ids.length === 0) return;
      setBaseDataStatus('loading');
      try {
        const disabilityData: Indicator[] =
          await IndicatorFetchService.getData(disabilityQuery);
        if (cancelled) return;
        setFilteredDisabilityData(TableService.filterDate(disabilityData));
        setBaseDataStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching data:', error);
        setBaseDataStatus('error');
      }
    };
    fetchDisabilityData();
    return () => {
      cancelled = true;
    };
  }, [disabilityQuery, CPLocationId]);

  // Benchmarked metric data: the true Regional rows are preserved and the
  // selected comparison group's average is added as a separate
  // ComparatorAverage column (synthesised if the metrics API returned no
  // Regional row for the metric). Passed only to the benchmarked tables and
  // charts; the primary support reason table keeps its true regional values.
  // Derived synchronously so the tables can never show a stale or mislabelled
  // value: while comparator data is unresolved (loading or failed), the
  // comparator column is null and renders as unavailable.
  const benchmarkedDisabilityData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredDisabilityData,
        benchmarkedMetricIds,
        dataByMetric,
        locationIds[2]
      ),
    [filteredDisabilityData, dataByMetric, locationIds]
  );

  useEffect(() => {
    const fetchReasonData = async () => {
      if (!CPLocationId) return;
      try {
        const supportReasonData: Indicator[] =
          await IndicatorFetchService.getData(supportReasonQuery);
        const filteredSupportReasonData =
          TableService.filterDate(supportReasonData);
        // One request serves both tables
        setPrimarySupportReasonData(
          filteredSupportReasonData.filter((item) =>
            supportReasonMetricIds.includes(item.metric_id)
          )
        );
        setStandardisedReasonData(
          filteredSupportReasonData.filter((item) =>
            standardisedSupportReasonMetricIds.includes(item.metric_id)
          )
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchReasonData();
  }, [supportReasonQuery]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await LocationService.getLocationIds(
            CPLocationId,
            false
          );
          setLocationIds(locationids);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    updatePrimaryReasonMetrics();
  }, [primarySupportReasonData]);

  // Primary support reason counts, with the comparator group's average added
  // alongside the true regional value
  const benchmarkedPrimaryReasonData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredPrimaryReasonData,
        supportReasonMetricIds,
        dataByMetric,
        locationIds[2]
      ),
    [filteredPrimaryReasonData, dataByMetric, locationIds]
  );

  // One reason at a time, for the figure and the table, keyed by its count code
  const STANDARDISED_REASON_FILTER_KEY = 'standardised-primary-reason-metric';
  // Shown in both the chart and table tabs
  const standardisedReasonFilterSync = useFilterSync(
    STANDARDISED_REASON_FILTER_KEY
  );
  const renderStandardisedReasonFilter = (idPrefix: string) => (
    <FilterSelectGroup
      key={standardisedReasonFilterSync.key}
      idPrefix={idPrefix}
      filterType={STANDARDISED_REASON_FILTER_KEY}
      filterLabel="Primary support reason"
      filters={supportReasonRowHeadersDefault}
      updateMethod={() => {
        updateChartSupportReason();
        standardisedReasonFilterSync.announce();
      }}
    />
  );

  const updateChartSupportReason = () => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STANDARDISED_REASON_FILTER_KEY) ?? 'null'
      );
      setChartSupportReason(
        stored?.metric_id in supportReasonRowHeadersDefault
          ? toStandardisedId(stored.metric_id)
          : DEFAULT_CHART_SUPPORT_REASON
      );
    } catch {
      setChartSupportReason(DEFAULT_CHART_SUPPORT_REASON);
    }
  };
  useEffect(() => {
    updateChartSupportReason();
  }, []);

  // Read once, so the figure and the table show the same values
  const standardisedReasonValues = locationValues(
    standardisedReasonData,
    chartSupportReason
  );

  const updatePrimaryReasonMetrics = () => {
    const storedData = localStorage.getItem('primary-reason-metrics');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData)) {
        const ids = parsedData.map((item) => item.metric_id);
        setFilteredPrimaryReasonData(
          primarySupportReasonData.filter((item) =>
            ids.includes(item.metric_id)
          )
        );
        const map: any = {};
        parsedData.map((item) => (map[item.metric_id] = item.filter_bedtype));
        setSupportReasonRowHeaders(map);
      }
    } else {
      setFilteredPrimaryReasonData(primarySupportReasonData);
      setSupportReasonRowHeaders(supportReasonRowHeadersDefault);
    }
  };

  return (
    <Layout
      title="General health and disability"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="disability-prevalence"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">General health and disability</h1>
          <p className="govuk-body-l">
            Data on disability prevalence, learning disability diagnoses and
            reasons for accessing care.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <MetricSection
        id="1"
        title="People who reported bad or very bad health"
        metric={'perc_general_health'}
        intro={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(METRICS.perc_general_health.helpUrl)}
                className="govuk-link"
              >
                people who reported bad or very bad health
              </a>{' '}
              is calculated.
            </p>
          </>
        }
        figureNumber={1}
        metricDescription="the percentage of the population who self-reported bad or very bad health"
        dateLabel={IndicatorService.getCensusYear(benchmarkedDisabilityData, [
          'perc_general_health',
        ])}
        tableCaption={
          <>
            Table 1: people who reported bad or very bad health –{' '}
            {locationNames.LALabel} <abbr title="local authority">LA</abbr>,{' '}
            {locationNames.RegionLabel} (regional average),{' '}
            {benchmarkedColumnHeaders.ComparatorLabel} and{' '}
            {benchmarkedColumnHeaders.CountryLabel},{' '}
            {IndicatorService.getCensusYear(benchmarkedDisabilityData, [
              'perc_general_health',
            ])}
          </>
        }
        columnHeaders={benchmarkedColumnHeaders}
        download={{
          filename: 'people_who_reported_bad_or_very_bad_health.csv',
          description: 'people who reported bad or very bad health',
        }}
        data={benchmarkedDisabilityData}
        laCode={locationIds[1]}
        laName={locationNames.LALabel}
        regionLabel={locationNames.RegionLabel}
        comparator={comparator}
        peer={{
          dataByMetric: dataByMetric,
          loading: chartLoading,
          error: chartError,
        }}
      />
      <MetricSection
        id="2"
        title="Disability prevalence"
        metric={'perc_population_disability'}
        intro={
          <>
            <p className="govuk-body-m">
              People who reported a long-term physical or mental health
              condition, or illness that limits day-to-day activities.
            </p>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(METRICS.perc_population_disability.helpUrl)}
                className="govuk-link"
              >
                disability prevalence
              </a>{' '}
              is calculated.
            </p>
          </>
        }
        figureNumber={2}
        metricDescription="the percentage of the population who reported a long-term physical or mental health condition, or illness that limits day-to-day activities"
        figureTitle="Percentage of the population who reported a long-term physical or mental health condition, or illness that limits day-to-day activities"
        dateLabel={IndicatorService.getCensusYear(benchmarkedDisabilityData, [
          'perc_population_disability',
        ])}
        tableCaption={
          <>
            Table 2: percentage of the population who reported a long-term
            physical or mental health condition, or illness that limits
            day-to-day activities – {locationNames.LALabel}{' '}
            <abbr title="local authority">LA</abbr>, {locationNames.RegionLabel}{' '}
            (regional average), {benchmarkedColumnHeaders.ComparatorLabel} and{' '}
            {benchmarkedColumnHeaders.CountryLabel},{' '}
            {IndicatorService.getCensusYear(benchmarkedDisabilityData, [
              'perc_population_disability',
            ])}
          </>
        }
        columnHeaders={benchmarkedColumnHeaders}
        download={{
          filename: 'disability_prevalence.csv',
          description: 'disability prevalence',
        }}
        data={benchmarkedDisabilityData}
        laCode={locationIds[1]}
        laName={locationNames.LALabel}
        regionLabel={locationNames.RegionLabel}
        comparator={comparator}
        peer={{
          dataByMetric: dataByMetric,
          loading: chartLoading,
          error: chartError,
        }}
      />
      <MetricSection
        id="3"
        title="Learning disability prevalence"
        metric={'learning_disability_prevalence'}
        intro={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(
                  METRICS.learning_disability_prevalence.helpUrl
                )}
                className="govuk-link"
              >
                learning disability prevalence is calculated
              </a>
              .
            </p>
          </>
        }
        figureNumber={3}
        metricDescription="learning disability prevalence"
        dateLabel={IndicatorService.getFinancialYear(
          benchmarkedDisabilityData,
          1,
          ['learning_disability_prevalence']
        )}
        tableCaption={
          <>
            Table 3: learning disability prevalence – {locationNames.LALabel}{' '}
            <abbr title="local authority">LA</abbr>, {locationNames.RegionLabel}{' '}
            (regional average), {benchmarkedColumnHeaders.ComparatorLabel} and{' '}
            {benchmarkedColumnHeaders.CountryLabel},{' '}
            {IndicatorService.getFinancialYear(benchmarkedDisabilityData, 1, [
              'learning_disability_prevalence',
            ])}
          </>
        }
        columnHeaders={benchmarkedColumnHeaders}
        download={{
          filename: 'learning_disability_prevalence.csv',
          description: 'learning disability prevalence',
        }}
        data={benchmarkedDisabilityData}
        laCode={locationIds[1]}
        laName={locationNames.LALabel}
        regionLabel={locationNames.RegionLabel}
        comparator={comparator}
        peer={{
          dataByMetric: dataByMetric,
          loading: chartLoading,
          error: chartError,
        }}
      />

      <DataBox
        dataTitle="Primary reason for people to access long-term adult social care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(
                  METRICS.learning_disability_support_18_and_over.helpUrl
                )}
                className="govuk-link"
              >
                primary reason for people to access long-term adult social care
                is calculated.
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="4"
          sharingMetricIds={supportReasonMetricIds}
          table={
            <>
              <SectionControls
                comparator={comparator.renderComparatorControl(
                  'comparator-table-4'
                )}
                filters={
                  <FilterCheckboxGroup
                    idPrefix="table-4"
                    filterType="primary-reason-metrics"
                    filterLabel="Primary support reason"
                    filters={supportReasonRowHeadersDefault}
                    updateMethod={updatePrimaryReasonMetrics}
                  />
                }
              />
              <DataTable
                tableref={tableref4}
                caption={
                  <>
                    Table 4: primary reason for all age groups to access
                    long-term adult social care – {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparator.comparatorAverageLabel},{' '}
                    {locationNames.RegionLabel} region and{' '}
                    {locationNames.CountryLabel},{' '}
                    {IndicatorService.getFinancialYear(
                      primarySupportReasonData,
                      1
                    )}
                  </>
                }
                source={SOURCES.ascActivityReport}
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparator.comparatorAverageLabel,
                }}
                metricColumnName="Primary support reason"
                rowHeaders={supportReasonRowHeaders}
                data={benchmarkedPrimaryReasonData}
                showCareProvider={false}
                smallNumberSuppression={true}
              >
                <p className="govuk-body-m">(*) denotes less than 5</p>
              </DataTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref4}
                filename="primary_reasons_for_accessing_care.csv"
                xLabel=""
                downloadType="primary reason for all age groups to access long-term adult social care"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Primary reason for people to access long-term adult social care – standardised per 100,000 of the total adult population (18+)"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(
                  METRICS.learning_disability_support_18_and_over_per100k_adults
                    .helpUrl
                )}
                className="govuk-link"
              >
                primary reason for people to access long-term adult social care
                per 100,000 adults is calculated
              </a>
              .
            </p>
            <NhsPeerGroupDetails />
          </>
        }
      >
        <DataTabs
          id="5"
          sharingMetricIds={[chartSupportReason]}
          chart={
            <>
              <PeerGroupBarChart
                laCode={laCode}
                laName={locationNames.LALabel}
                metric={chartSupportReason}
                currentLaValue={standardisedReasonValues.la}
                nationalAverageValue={standardisedReasonValues.national}
                regionalAverageValue={standardisedReasonValues.regional}
                regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
                peerData={dataByMetric[chartSupportReason] ?? null}
                loading={chartLoading}
                error={chartError}
                comparatorControl={
                  <SectionControls
                    comparator={comparator.renderComparatorControl(
                      'comparator-chart-4'
                    )}
                    filters={renderStandardisedReasonFilter('chart-5')}
                  />
                }
                comparatorLabel={comparator.comparatorLabel}
                comparatorAverageLabel={comparator.comparatorAverageLabel}
                metricDescription={`the rate of people accessing long-term adult social care for ${standardisedRowHeadersDefault[
                  chartSupportReason
                ]?.toLowerCase()}, per 100,000 of the total adult population (18+)`}
                figureTitle={`${
                  standardisedRowHeadersDefault[chartSupportReason]
                } per 100,000 of the total adult population (18+)`}
                dateLabel={IndicatorService.getFinancialYear(
                  standardisedReasonData,
                  1
                )}
                figureNumber={4}
              />
              <p className="govuk-body-s">
                Local authorities with an underlying count of between 1 and 5
                are suppressed and are not shown on this chart.
              </p>
            </>
          }
          table={
            <>
              <SectionControls
                comparator={comparator.renderComparatorControl(
                  'comparator-table-5'
                )}
                filters={renderStandardisedReasonFilter('table-5')}
              />
              <PeerGroupTable
                tableref={tableref5}
                metric={chartSupportReason}
                caption={
                  <>
                    Table 5: people accessing long-term adult social care for{' '}
                    {standardisedRowHeadersDefault[
                      chartSupportReason
                    ]?.toLowerCase()}
                    , standardised per 100,000 of the total adult population
                    (18+) – {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr> and its comparison
                    group, {comparator.comparatorAverageLabel},{' '}
                    {locationNames.RegionLabel} (regional average) and{' '}
                    {locationNames.CountryLabel} (national average),{' '}
                    {IndicatorService.getFinancialYear(
                      standardisedReasonData,
                      1
                    )}
                  </>
                }
                valueHeader={`${standardisedRowHeadersDefault[chartSupportReason]} per 100,000 adults`}
                laCode={laCode}
                laName={locationNames.LALabel}
                currentLaValue={standardisedReasonValues.la}
                regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
                regionalAverageValue={standardisedReasonValues.regional}
                nationalAverageValue={standardisedReasonValues.national}
                peerData={dataByMetric[chartSupportReason] ?? null}
                loading={chartLoading}
                comparatorAverageLabel={comparator.comparatorAverageLabel}
              >
                <p className="govuk-body-s">
                  Local authorities with an underlying count of between 1 and 5
                  are suppressed and are not shown in this table.
                </p>
              </PeerGroupTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref5}
                filename="primary_reasons_for_accessing_care_standardised.csv"
                xLabel=""
                downloadType="primary reason for all age groups to access long-term adult social care, standardised per 100,000 adults"
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Disability prevalence"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url={METRICS.perc_population_disability.helpUrl}
        />
        <DataLinkCard
          label="Learning disability prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url={METRICS.learning_disability_prevalence.helpUrl}
        />
        <DataLinkCard
          label="People who reported bad or very bad health"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url={METRICS.perc_general_health.helpUrl}
        />
        <DataLinkCard
          label="Primary reason for people to access long-term adult social care"
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url={METRICS.learning_disability_support_18_and_over.helpUrl}
        />
        <DataLinkCard
          label="Primary reason for people to access long-term adult social care – standardised per 100,000 of the total adult (18+) population"
          sources="NHS England, Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={false}
          url={
            METRICS.learning_disability_support_18_and_over_per100k_adults
              .helpUrl
          }
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence"
          description="Data on dementia prevalence."
          url="/topics/population-needs/dementia-prevalence/data"
        />
        <DataLinkCard
          label="Economic factors and household composition"
          description="Data on household deprivation, property ownership and older people living alone."
          url="/topics/population-needs/household-composition-and-economic-factors/data"
        />
        <DataLinkCard
          label="Population size and age group percentages"
          description="Population data at LA, regional and national levels for England."
          url="/topics/population-needs/population-age-and-size/data"
        />
      </RelatedDataList>

      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
