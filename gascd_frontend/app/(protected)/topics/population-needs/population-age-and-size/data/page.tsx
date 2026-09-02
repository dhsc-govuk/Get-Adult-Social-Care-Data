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
import { Indicator } from '@/data/interfaces/Indicator';
import TableService from '@/services/Table/TableService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import { Locations } from '@/data/interfaces/Locations';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import ComparatorGroupBuilder from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';

const AGE_GROUP_LABELS: Record<string, string> = {
  perc_18_64: 'Aged 18 to 64',
  perc_65over: 'Aged 65 and over',
  perc_75over: 'Aged 75 and over',
  perc_85over: 'Aged 85 and over',
};

export default function ProvisionAndOccupancyPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [baseDemographicData, setBaseDemographicData] = useState<Indicator[]>(
    []
  );
  // Status of the metric-data request that supplies the user's LA and England
  // values. Starts as loading because the query cannot be built until the
  // location ids resolve.
  const [baseDataStatus, setBaseDataStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

  // Age group plotted by the benchmarked age group percentages chart
  const [selectedAgeMetric, setSelectedAgeMetric] = useState('perc_18_64');

  const [selectedAge, setSelectedAge] = useState('aged-85-years-and-over');
  const [mapAvailable, setMapAvailable] = useState(true);
  const [mapStateKey, setMapStateKey] = useState(1);
  const [locationData, setLocationData] = useState<Locations | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const mapAlternative =
    'https://www.ons.gov.uk/census/maps/choropleth/population/age/resident-age-11a/aged-85-years-and-over';

  const ageGroupMetricIds = Object.keys(AGE_GROUP_LABELS);
  const demographicMetricIds = ['total_population', ...ageGroupMetricIds];

  const metricPage = 'population-size-and-age-group';
  const laCode = locationIds[1];

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
  } = usePeerGroupData(laCode, demographicMetricIds, selection, groups);
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
  // Column headers for the benchmarked tables: their Regional column is
  // repurposed to show the comparator group's average. The country column
  // keeps the plain country name on this page.
  const benchmarkedColumnHeaders = {
    ...locationNames,
    RegionLabel: comparatorAverageLabel,
  };
  // The population size table shows the comparator group's combined
  // population instead of a mean, which is what reads naturally next to
  // England's total.
  const comparatorTotalLabel = selectedGroup
    ? `${selectedGroup.name} total`
    : 'NHS peer group total';
  const populationSizeColumnHeaders = {
    ...locationNames,
    RegionLabel: comparatorTotalLabel,
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

  // Renders the comparison group control, with any extra control (the age
  // group select on the chart) alongside it and the builder panel below
  const renderComparatorControl = (
    idPrefix: string,
    extraControl?: React.ReactNode
  ) => {
    const builderOpenHere = builderState?.idPrefix === idPrefix;
    const editingGroup = builderOpenHere
      ? groups.find((group) => group.id === builderState?.editingGroupId)
      : undefined;

    return (
      <>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
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
          {extraControl}
        </div>
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

  const ageGroupSelect = (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-!-font-weight-bold"
        htmlFor="age-group-select"
      >
        Age group
      </label>
      <select
        id="age-group-select"
        className="govuk-select"
        value={selectedAgeMetric}
        onChange={(event) => setSelectedAgeMetric(event.target.value)}
        aria-label="Select age group"
      >
        {ageGroupMetricIds.map((metricId) => (
          <option key={metricId} value={metricId}>
            {AGE_GROUP_LABELS[metricId]}
          </option>
        ))}
      </select>
    </div>
  );

  // Shared explanatory note shown in every benchmarked data box
  const nhsPeerGroupDetails = (
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
        developed by NHS digital in 2022/23 to support benchmarking. This is
        one of a number of approaches that aim to group authorities with
        similar socio-economic and geographic factors (e.g. age, ethnicity,
        education). It is important to note that there is limited evidence of
        which factors are the most important drivers of variation in adult
        social care. As a result, these statistical neighbours should be viewed
        as a helpful starting point for benchmarking, rather than a definitive
        indication of which authorities are most alike or measuring relative
        performance.
      </div>
    </details>
  );

  const handleAgeChange = (event: any) => {
    setSelectedAge(event.target.value);
  };

  const handleReset = (event: any) => {
    event.preventDefault();
    setMapStateKey(mapStateKey + 1);
  };

  const handleUpdateClick = (event: any) => {
    event.preventDefault();
    updateMap();
  };

  const updateMap = () => {
    if (locationData) {
      const newUrl = generatePopulationMapURL(
        locationData.la_code,
        selectedAge
      );
      if (newUrl) {
        setMapUrl(newUrl);
        setMapAvailable(true);
      } else {
        setMapAvailable(false);
      }
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      if (CPLocationId) {
        try {
          const location_data =
            await LocationService.getLocations(CPLocationId);
          setLocationData(location_data);
        } catch {
          // LocationService.getLocations already logs the failure server-side;
          // swallow here so the rejected promise doesn't go unhandled.
        }
      }
    };
    fetchLocation();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationData) {
      updateMap();
    }
  }, [locationData]);

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
    demographicMetricIds.forEach((metric_id) => {
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
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setDemographicQuery(() => ({
        metric_ids: demographicMetricIds,
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    let cancelled = false;
    const fetchAllData = async () => {
      if (!CPLocationId || demographicQuery.metric_ids.length === 0) return;
      setBaseDataStatus('loading');
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        if (cancelled) return;
        setBaseDemographicData(TableService.filterDate(demographicData));
        setBaseDataStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching data:', error);
        setBaseDataStatus('error');
      }
    };
    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, [demographicQuery, CPLocationId]);

  // The Regional rows are repurposed to show the selected comparison group's
  // average (synthesised if the metrics API returned no Regional row). Derived
  // synchronously so the tables can never show a stale or mislabelled value:
  // while comparator data is unresolved (loading or failed), the row is null
  // and renders as unavailable rather than falling back to the true regional
  // value under a comparator-average heading.
  const benchmarkedDemographicData = useMemo(() => {
    const merged = mergeComparatorAverage(
      baseDemographicData,
      demographicMetricIds,
      dataByMetric,
      locationIds[2]
    );
    // Total population is benchmarked against the comparator group's summed
    // population rather than its average. The user's own LA is excluded from
    // the sum, as it is everywhere else the peer rows are used.
    const ownLaCode = locationIds[1];
    const peers = dataByMetric['total_population']?.localAuthorityPeers.filter(
      (peer) => peer.code !== ownLaCode && peer.metricValue !== null
    );
    const peerPopulationTotal =
      peers && peers.length > 0
        ? peers.reduce((sum, peer) => sum + (peer.metricValue as number), 0)
        : null;
    return merged.map((d) =>
      d.metric_id === 'total_population' && d.location_type === 'Regional'
        ? { ...d, data_point: peerPopulationTotal }
        : d
    );
  }, [baseDemographicData, dataByMetric, locationIds]);

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

  const selectedAgeLabel = AGE_GROUP_LABELS[selectedAgeMetric];

  return (
    <Layout
      title="Population size and age group percentages"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="population-size-and-age-group"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Population size and age group percentages
          </h1>
          <p className="govuk-body-l">
            Population data at <abbr title="local authority">LA</abbr>, NHS
            peer group and national levels for England.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Adult population size"
        dataInfo={
          <>
            <p>
              Find out how{' '}
              <a
                href={withBasePath('/help/population-size')}
                className="govuk-link"
              >
                population size
              </a>{' '}
              is calculated.
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <DataTabs
          id="1"
          sharingMetricIds={['total_population']}
          table={
            <>
              {renderComparatorControl('comparator-table-1')}
              <DataTable
                tableref={tableref1}
                caption={
                  <>
                    Table 1: adult population size – {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {populationSizeColumnHeaders.RegionLabel} and{' '}
                    {populationSizeColumnHeaders.CountryLabel},{' '}
                    {IndicatorService.getMostRecentDate(
                      benchmarkedDemographicData,
                      ['total_population']
                    )}
                  </>
                }
                source={
                  'Population estimates from the Office for National Statistics (ONS)'
                }
                columnHeaders={populationSizeColumnHeaders}
                rowHeaders={{
                  total_population: 'Total adult population',
                }}
                data={benchmarkedDemographicData}
                showCareProvider={false}
                showAverageLabel={false}
              ></DataTable>
            </>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <ConditionalText
                data={baseDemographicData}
                ColumnHeaders={locationNames}
                section="Drivers"
                metric_Id="perc_65over"
              ></ConditionalText>
            </>
          }
          download={
            <>
              {renderComparatorControl('comparator-download-1')}
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="adult_population_size.csv"
                xLabel=""
                downloadType="adult population size"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Age group percentages"
        dataInfo={
          <>
            <p>
              Find out how{' '}
              <a
                href={withBasePath('/help/population-age')}
                className="govuk-link"
              >
                age group percentages
              </a>{' '}
              are calculated.
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <DataTabs
          id="2"
          sharingMetricIds={ageGroupMetricIds}
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <DataTable
                tableref={tableref2}
                caption={
                  <>
                    Table 2: age group percentages – {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {benchmarkedColumnHeaders.RegionLabel} and{' '}
                    {benchmarkedColumnHeaders.CountryLabel},{' '}
                    {IndicatorService.getMostRecentDate(
                      benchmarkedDemographicData,
                      ageGroupMetricIds
                    )}
                  </>
                }
                source={
                  'Population estimates from the Office for National Statistics (ONS)'
                }
                columnHeaders={benchmarkedColumnHeaders}
                rowHeaders={AGE_GROUP_LABELS}
                data={benchmarkedDemographicData}
                showCareProvider={false}
                percentageRows={ageGroupMetricIds}
                showAverageLabel={false}
              ></DataTable>
            </>
          }
          download={
            <>
              {renderComparatorControl('comparator-download-2')}
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="age_group_percentages.csv"
                xLabel=""
                downloadType="age group percentages"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === selectedAgeMetric &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === selectedAgeMetric &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              peerData={dataByMetric[selectedAgeMetric] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl(
                'comparator-chart-2',
                ageGroupSelect
              )}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              nationalAverageLabel="England"
              metricDescription={`the percentage of the population ${selectedAgeLabel.toLowerCase()}`}
              figureTitle={`Percentage of the population ${selectedAgeLabel.toLowerCase()}`}
              figureNumber={1}
              sourceText="Source: Population estimates from the Office for National Statistics (ONS)"
            />
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Age group percentages"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-age"
        />
        <DataLinkCard
          label="Population size"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-size"
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
          label="General health and disability"
          description="Data on disability prevalence, learning disability diagnoses and reasons for accessing care."
          url="/topics/population-needs/disability-prevalence/data"
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
