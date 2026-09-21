'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
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
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import ComparatorGroupBuilder from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import { ALLOWED_CP_USER_TYPES } from '@/constants';
import { User, useSession } from '@/lib/auth-client';

const CARE_HOME_COMM_CATEGORY = 'community';

const showCPLevelData = (user: User | null | undefined) => {
  return (
    (user &&
      ALLOWED_CP_USER_TYPES.includes(user.locationType || '') &&
      // Case-insensitive: the data API returns categories like 'Residential'
      user.selectedLocationCategory?.toLowerCase() ===
        CARE_HOME_COMM_CATEGORY) ||
    false
  );
};

export default function NumberPeopleReceivingCarePage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const { data: session } = useSession();

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
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  const demographicMetricIds = ['nccc_num_clients_comm_care'];
  // TODO(GASCD-246): the standardised "per 100,000 of the total adult
  // population (18+)" metric does not exist yet — it is absent from
  // MetricCodeEnum and the metrics table. Built against the unstandardised
  // metric so the presentation can be reviewed; swap this for the real code
  // once the backend exposes it.
  const STANDARDISED_METRIC_ID = 'nccc_num_clients_comm_care';

  // This page resolves locations with careProvider: true, so the ids are
  // ['Indicator', careProviderLocation, la, region, country] — one further
  // along than on the local authority pages.
  const laCode = locationIds[2];
  const regionCode = locationIds[3];
  const metricPage = 'number-of-people-receiving-care';

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
    loading: chartLoading,
    error: chartError,
  } = usePeerGroupData(laCode, demographicMetricIds, selection, groups);
  const { authorities, error: authoritiesError } = useAllLocalAuthorities(
    builderState !== null
  );

  const selectedGroup =
    selection.kind === 'custom'
      ? groups.find((group) => group.id === selection.groupId)
      : undefined;
  const comparatorLabel = selectedGroup ? selectedGroup.name : undefined;
  const comparatorAverageLabel = selectedGroup
    ? `${selectedGroup.name} (average)`
    : NHS_PEER_GROUP_AVERAGE_LABEL;

  // The comparator average is added as its own column alongside the true
  // regional average. Derived synchronously so the table can never show a
  // stale or mislabelled value: while the peer data is unresolved the column
  // is null and renders as unavailable.
  const benchmarkedDemographicData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredDemographicData,
        demographicMetricIds,
        dataByMetric,
        regionCode
      ),
    [filteredDemographicData, dataByMetric, regionCode]
  );

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

  // Shared explanatory note shown alongside the comparator column, matching
  // the other benchmarked pages
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
        developed by NHS digital in 2022/23 to support benchmarking. This is one
        of a number of approaches that aim to group authorities with similar
        socio-economic and geographic factors (e.g. age, ethnicity, education).
        It is important to note that there is limited evidence of which factors
        are the most important drivers of variation in adult social care. As a
        result, these statistical neighbours should be viewed as a helpful
        starting point for benchmarking, rather than a definitive indication of
        which authorities are most alike or measuring relative performance.
      </div>
    </details>
  );

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

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/topics/residential-care/subtopics',
    },
  ];


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
            true
          );
          setLocationNames(locationNames);
          setLocationNamesWithAverageLabels({
            CPLabel: locationNames.CPLabel!,
            LALabel: `Total for ${locationNames.LALabel}`,
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
      setDemographicQuery(() => ({
        metric_ids: demographicMetricIds,
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setFilteredDemographicData(filteredDemographicData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await LocationService.getLocationIds(
            CPLocationId,
            true
          );
          setLocationIds(locationids);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  return (
    <Layout
      title="Number of adults receiving community social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="number-of-people-receiving-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Number of adults receiving community social care
          </h1>
          <p className="govuk-body-l">
            Data on the number of people supported through community social
            care, including trends over time.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Number of adults receiving community social care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/number-people-receiving-care-from-community-social-care-provider'
                )}
                className="govuk-link"
              >
                how the number of people receiving community social care is
                calculated
              </a>
              .
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <DataTabs
          id="1"
          sharingMetricIds={demographicMetricIds}
          table={
            <>
              {renderComparatorControl('comparator-table-1')}
              <DataTable
                tableref={tableref1}
                caption={`Table 1: number of people receiving community social care in the last month – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} region, ${comparatorAverageLabel} and ${locationNames.CountryLabel}, ${IndicatorService.getMostRecentMonthYear(benchmarkedDemographicData)}`}
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={{
                  nccc_num_clients_comm_care: `People receiving community social care in ${IndicatorService.getMostRecentMonthYear(benchmarkedDemographicData)}`,
                }}
                data={benchmarkedDemographicData}
                showCareProvider={showCPLevelData(session?.user)}
                careProviderMedianMetrics={{
                  nccc_num_clients_comm_care: 'nccc_num_clients_comm_care',
                }}
                percentageRows={[]}
              ></DataTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="number_of_people_receiving_community_social_care.csv"
                xLabel=""
                downloadType="number of people receiving community social care in the last month"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="[REPLACE WITH REAL METRIC]: Number of adults receiving community social care – standardised per 100,000 of the total adult population (18+)"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/number-people-receiving-care-from-community-social-care-provider'
                )}
                className="govuk-link"
              >
                how the number of people receiving community social care is
                calculated
              </a>
              .
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <DataTabs
          id="2"
          sharingMetricIds={[STANDARDISED_METRIC_ID]}
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === STANDARDISED_METRIC_ID &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === STANDARDISED_METRIC_ID &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              regionalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === STANDARDISED_METRIC_ID &&
                    d.location_type === 'Regional'
                )?.data_point ?? null
              }
              regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
              peerData={dataByMetric[STANDARDISED_METRIC_ID] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-1')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription="the number of people receiving community social care, standardised per 100,000 of the total adult population (18+)"
              figureTitle="Number of people receiving community social care in the last month, standardised per 100,000 of the total population (18+)"
              figureNumber={1}
              sourceText="Capacity Tracker from the Department of Health and Social Care (DHSC) & population estimates from ONS"
            />
          }
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <DataTable
                tableref={tableref2}
                caption={`Table 2: number of people receiving community social care in the last month, standardised per 100,000 of the total population (18+) – ${locationNames.LALabel} LA, ${comparatorAverageLabel}, ${locationNames.RegionLabel} (regional average) and ${locationNames.CountryLabel} (national average), ${IndicatorService.getMostRecentMonthYear(benchmarkedDemographicData)}`}
                source="Capacity Tracker from the Department of Health and Social Care (DHSC) & population estimates from ONS"
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  CPLabel: null,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={{
                  [STANDARDISED_METRIC_ID]: `People receiving community social care in ${IndicatorService.getMostRecentMonthYear(benchmarkedDemographicData)}`,
                }}
                data={benchmarkedDemographicData}
                showCareProvider={false}
                percentageRows={[]}
              ></DataTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="number_of_people_receiving_community_social_care_standardised.csv"
                xLabel=""
                downloadType="number of people receiving community social care per 100,000 adults in the last month"
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Number of people receiving care from a community social care provider"
          sources="Capacity Tracker"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/number-people-receiving-care-from-community-social-care-provider"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
        />
        <DataLinkCard
          label="Care provider services"
          description="Data on residential care homes and nursing homes by service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Unpaid care"
          description="Statistics on the people who provide unpaid care to family members, friends and neighbours."
          url="/topics/residential-care/unpaid-care/data"
        />
      </RelatedDataList>

      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        // care provider included which shifts local authority id to index 2
        localAuthorityId={locationIds[2]}
      />
      <BackToTop />
    </Layout>
  );
}
