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
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import ComparatorGroupBuilder from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';

export default function DisabilityPrevalence() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);

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

  // Metrics with peer group / custom comparator benchmarking. The other
  // tables on this page keep their true regional values.
  const benchmarkedMetricIds = ['learning_disability_prevalence'];

  const metricPage = 'disability-prevalence';
  const laCode = locationIds[1];

  const {
    groups,
    selection,
    setSelection,
    saveGroup,
    updateGroup,
    deleteGroup,
  } = useComparatorGroups();
  // Which comparator control has its builder panel open, and whether it is
  // editing an existing group (by id) or creating a new one
  const [builderState, setBuilderState] = useState<{
    idPrefix: string;
    editingGroupId?: string;
  } | null>(null);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const {
    dataByMetric,
    loading: peerLoading,
    error: peerError,
  } = usePeerGroupData(laCode, benchmarkedMetricIds, selection, groups);
  // A chart needs both the comparator data and the user's own LA / England
  // values before it is complete, so it waits for (and fails on) either
  // request rather than rendering peer bars without the user's authority.
  const chartLoading = peerLoading || baseDataStatus === 'loading';
  const chartError = peerError || baseDataStatus === 'error';
  const { authorities, error: authoritiesError } = useAllLocalAuthorities(
    builderState !== null
  );

  const selectedGroup =
    selection.kind === 'custom'
      ? groups.find((group) => group.id === selection.groupId)
      : undefined;
  const comparatorLabel = selectedGroup ? selectedGroup.name : undefined;
  const comparatorAverageLabel = selectedGroup
    ? `${selectedGroup.name} average`
    : NHS_PEER_GROUP_AVERAGE_LABEL;
  // Column headers for the benchmarked learning disability table only: its
  // Regional column is repurposed to show the comparator group's average
  const learningDisabilityColumnHeaders = {
    ...locationNames,
    RegionLabel: comparatorAverageLabel,
    CountryLabel: 'England (national average)',
  };

  const handleComparatorChange = (newSelection: ComparatorSelection) => {
    setSelection(newSelection);
    setBuilderState(null);
    setBuilderError(null);
    AnalyticsService.trackComparatorChange(newSelection.kind, metricPage);
  };

  const handleGroupSave = async (group: {
    name: string;
    laCodes: string[];
  }) => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await updateGroup(builderState.editingGroupId, group);
        AnalyticsService.trackComparatorGroupEdit(group.laCodes.length);
      } else {
        await saveGroup(group);
        AnalyticsService.trackComparatorGroupSave(group.laCodes.length);
        AnalyticsService.trackComparatorChange('custom', metricPage);
      }
      setBuilderState(null);
    } catch (error) {
      // Keep the builder open so nothing the user entered is lost
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'Your comparator group could not be saved. Try again.'
      );
    }
  };

  const handleGroupDelete = async () => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await deleteGroup(builderState.editingGroupId);
        AnalyticsService.trackComparatorGroupDelete();
      }
      setBuilderState(null);
    } catch (error) {
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'The comparator group could not be deleted. Try again.'
      );
    }
  };

  const handleEditToggle = (idPrefix: string) => {
    if (selection.kind !== 'custom') return;
    setBuilderError(null);
    setBuilderState((current) =>
      current?.idPrefix === idPrefix && current.editingGroupId
        ? null
        : { idPrefix, editingGroupId: selection.groupId }
    );
  };

  const renderComparatorControl = (idPrefix: string) => {
    const builderOpenHere = builderState?.idPrefix === idPrefix;
    const editingGroup = builderOpenHere
      ? groups.find((group) => group.id === builderState?.editingGroupId)
      : undefined;

    return (
      <>
        <ComparatorGroupSelect
          idPrefix={idPrefix}
          selection={selection}
          groups={groups}
          onChange={handleComparatorChange}
          onCreateNew={() => setBuilderState({ idPrefix })}
          onEdit={() => handleEditToggle(idPrefix)}
          builderMode={
            builderOpenHere ? (editingGroup ? 'edit' : 'create') : null
          }
        />
        {builderOpenHere && (
          <ComparatorGroupBuilder
            // Remount when switching between create and edit so the form
            // state is reinitialised from the right group
            key={editingGroup?.id ?? 'create'}
            idPrefix={idPrefix}
            allAuthorities={authorities}
            authoritiesError={authoritiesError}
            ownLaCode={laCode}
            existingNames={groups
              .filter((group) => group.id !== editingGroup?.id)
              .map((group) => group.name)}
            onSave={handleGroupSave}
            onCancel={() => {
              setBuilderState(null);
              setBuilderError(null);
            }}
            mode={editingGroup ? 'edit' : 'create'}
            initialName={editingGroup?.name}
            initialCodes={editingGroup?.laCodes}
            onDelete={editingGroup ? handleGroupDelete : undefined}
            serverError={builderError ?? undefined}
          />
        )}
      </>
    );
  };

  const supportReasonRowHeadersDefault = {
    learning_disability_support_18_and_over: 'Learning disability support',
    mental_health_support_18_and_over: 'Mental health support',
    access_and_mobility_only_physical_support_18_and_over:
      'Physical support: Access and mobility only',
    personal_care_support_physical_support_18_and_over:
      'Physical support: Personal care support',
    support_for_dual_impairment_sensory_support_18_and_over:
      'Sensory support: Support for dual impairment',
    support_for_hearing_impairment_sensory_support_18_and_over:
      'Sensory support: Support for hearing impairment',
    support_for_visual_impairment_sensory_support_18_and_over:
      'Sensory support: Support for visual impairment',
    asylum_seeker_support_social_support_18_and_over:
      'Social support: Asylum seeker support',
    substance_misuse_support_social_support_18_and_over:
      'Social support: Substance misuse support',
    support_for_social_isolation_other_social_support_18_and_over:
      'Social support: Support for social isolation or other reason',
    support_with_memory_and_cognition_18_and_over:
      'Support with memory and cognition',
  };

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
        metric_ids: supportReasonMetricIds,
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

  // Learning disability data with the Regional row repurposed to show the
  // selected comparison group's average (synthesised if the metrics API
  // returned no Regional row). Passed only to the benchmarked learning
  // disability table and chart; the other tables keep filteredDisabilityData
  // with its true regional values. Derived synchronously so the table can
  // never show a stale or mislabelled value: while comparator data is
  // unresolved (loading or failed), the row is null and renders as
  // unavailable rather than falling back to the true regional value under a
  // comparator-average heading.
  const learningDisabilityData = useMemo(
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
        setPrimarySupportReasonData(filteredSupportReasonData);
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
      <DataBox
        dataTitle="Disability prevalence"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(
                  '/help/people-who-reported-bad-or-very-bad-health'
                )}
                className="govuk-link"
              >
                people who reported bad or very bad health
              </a>{' '}
              and{' '}
              <a
                href={withBasePath('/help/disability-prevalence')}
                className="govuk-link"
              >
                disability prevalence
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <DataTabs
          id="1"
          sharingMetricIds={[
            'perc_population_disability',
            'perc_general_health',
          ]}
          table={
            <DataTable
              tableref={tableref1}
              caption={
                <>
                  Table 1: self-reporting on general health and disability –{' '}
                  {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getMostRecentMonthYear(
                    filteredDisabilityData
                  )}
                </>
              }
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_general_health:
                  'People who reported bad or very bad health',
                perc_population_disability:
                  'Disability prevalence – people who reported a long-term physical or mental health condition, or illness that limits day-to-day activities',
              }}
              data={filteredDisabilityData}
              showCareProvider={false}
              percentageRows={[
                'perc_general_health',
                'perc_population_disability',
              ]}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="general_health_and_disability.csv"
                xLabel=""
                downloadType="self-reporting on general health and disability"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Learning disability prevalence"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath('/help/learning-disability-prevalence')}
                className="govuk-link"
              >
                learning disability prevalence is calculated
              </a>
              .
            </p>
            <details className="govuk-details govuk-!-margin-top-3">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Interpreting the NHS Peer Group
                </span>
              </summary>
              <div className="govuk-details__text">
                GASCD currently uses a{' '}
                <a
                  className="govuk-link"
                  href="https://github.com/NHSDigital/ASC_LA_Peer_Groups"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  statistical neighbours model
                </a>{' '}
                developed by NHS digital in 2022/23 to support benchmarking.
                This is one of a number of approaches that aim to group
                authorities with similar socio-economic and geographic factors
                (e.g. age, ethnicity, education). It is important to note that
                there is limited evidence of which factors are the most
                important drivers of variation in adult social care. As a
                result, these statistical neighbours should be viewed as a
                helpful starting point for benchmarking, rather than a
                definitive indication of which authorities are most alike or
                measuring relative performance.
              </div>
            </details>
          </>
        }
      >
        <DataTabs
          id="2"
          sharingMetricIds={['learning_disability_prevalence']}
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <DataTable
                tableref={tableref2}
                caption={
                  <>
                    Table 2: learning disability prevalence –{' '}
                    {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {learningDisabilityColumnHeaders.RegionLabel} and{' '}
                    {learningDisabilityColumnHeaders.CountryLabel},{' '}
                    {IndicatorService.getMostRecentDate(learningDisabilityData)}
                  </>
                }
                source={
                  'Fingertips public health profiles from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={learningDisabilityColumnHeaders}
                rowHeaders={{
                  learning_disability_prevalence:
                    'Learning disability prevalence',
                }}
                data={learningDisabilityData}
                showCareProvider={false}
                percentageRows={['learning_disability_prevalence']}
              ></DataTable>
            </>
          }
          download={
            <>
              {renderComparatorControl('comparator-download-2')}
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="learning_disability_prevalence.csv"
                xLabel=""
                downloadType="learning disability prevalence"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                learningDisabilityData.find(
                  (d) =>
                    d.metric_id === 'learning_disability_prevalence' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                learningDisabilityData.find(
                  (d) =>
                    d.metric_id === 'learning_disability_prevalence' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              peerData={dataByMetric['learning_disability_prevalence'] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-2')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription="learning disability prevalence"
              figureTitle="Learning disability prevalence"
              figureNumber={2}
              sourceText="Source: Fingertips public health profiles from the Department of Health and Social Care (DHSC)"
            />
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Primary reason for people to access long-term adult social care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href={withBasePath(
                  '/help/primary-reason-for-accessing-long-term-adult-social-care'
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
        <FilterCheckboxGroup
          filterType="primary-reason-metrics"
          filterLabel="Primary support reason"
          filters={supportReasonRowHeadersDefault}
          updateMethod={updatePrimaryReasonMetrics}
        />
        <DataTabs
          id="3"
          sharingMetricIds={supportReasonMetricIds}
          table={
            <DataTable
              tableref={tableref3}
              caption={
                <>
                  Table 3: primary reason for all age groups to access long-term
                  adult social care – {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getMostRecentDate(filteredDisabilityData)}
                </>
              }
              source={
                'Adult Social Care Activity Report from DHSC'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName="Primary support reason"
              rowHeaders={supportReasonRowHeaders}
              data={filteredPrimaryReasonData}
              showCareProvider={false}
              smallNumberSuppression={true}
            >
              <p className="govuk-body-m">(*) denotes less than 5</p>
            </DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="primary_reasons_for_accessing_care.csv"
                xLabel=""
                downloadType="primary reason for all age groups to access long-term adult social care"
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
          url="/help/disability-prevalence"
        />
        <DataLinkCard
          label="Learning disability prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/learning-disability-prevalence"
        />
        <DataLinkCard
          label="People who reported bad or very bad health"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/people-who-reported-bad-or-very-bad-health"
        />
        <DataLinkCard
          label="Primary reason for people to access long-term adult social care"
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/primary-reason-for-accessing-long-term-adult-social-care"
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
