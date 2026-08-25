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
import Link from 'next/link';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
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

export default function ProvisionAndOccupancyPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    CPLabel: null,
    LALabel: 'Loading...',
    RegionLabel: 'NHS peer group average',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [baseDemographicData, setBaseDemographicData] = useState<Indicator[]>(
    []
  );
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  // Status of the metric-data request that supplies the user's LA and England
  // values. Starts as loading because the query cannot be built until the
  // location ids resolve.
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

  const demographicMetricIds = [
    'perc_households_deprivation_deprived',
    'perc_household_ownership',
    'perc_households_one_person',
  ];

  const metricPage = 'household-composition-and-economic-factors';
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
  const tableColumnHeaders = {
    ...locationNames,
    RegionLabel: comparatorAverageLabel,
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
          setLocationNames({
            CPLabel: locationNames.CPLabel,
            LALabel: locationNames.LALabel,
            RegionLabel: 'NHS peer group average',
            CountryLabel: 'England (national average)',
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

  // The Regional row is repurposed to show the selected comparison group's
  // average (synthesised if the metrics API returned no Regional row). Derived
  // synchronously so the table can never show a stale or mislabelled value:
  // while comparator data is unresolved (loading or failed), the row is null
  // and renders as unavailable rather than falling back to the true regional
  // value under a comparator-average heading.
  const filteredDemographicData = useMemo(
    () =>
      mergeComparatorAverage(
        baseDemographicData,
        demographicMetricIds,
        dataByMetric,
        locationIds[2]
      ),
    [baseDemographicData, dataByMetric, locationIds]
  );

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

  return (
    <Layout
      title="Economic factors and household composition"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Economic factors and household composition
          </h1>
          <p className="govuk-body-l">
            Data on household deprivation, property ownership and older people
            living alone.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Household deprivation"
        dataInfo={
          <p className="govuk-body-m">
            In Census 2021, households were classified by 4 dimensions of
            deprivation: education, employment, health and disability, and
            household overcrowding.
          </p>
        }
      >
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              How the 4 dimensions of deprivation are measured
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              All the following characteristics must apply for a household to be
              classified as &lsquo;deprived in 4 dimensions&rsquo; in Census
              2021 data.
            </p>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>
                No one in the household has at least level 2 education and no
                one aged 16 to 18 years is a full-time student.
              </li>
              <li>
                A household member is unemployed or economically inactive due to
                long-term sickness or disability, and is not a full-time
                student.
              </li>
              <li>
                Any member of the household has general health that is bad or
                very bad, or is identified as disabled.
              </li>
              <li>
                The household&apos;s accommodation is overcrowded, is in a
                shared dwelling, or has no central heating.
              </li>
            </ol>
            <Link className="govuk-link" href="/help/household-deprivation">
              More details on household deprivation data.
            </Link>
          </div>
        </details>
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
            education). It is important to note that there is limited evidence
            of which factors are the most important drivers of variation in
            adult social care. As a result, these statistical neighbours should
            be viewed as a helpful starting point for benchmarking, rather than
            a definitive indication of which authorities are most alike or
            measuring relative performance.
          </div>
        </details>
        <DataTabs
          id="1"
          table={
            <>
              {renderComparatorControl('comparator-table-1')}
              <DataTable
                tableref={tableref1}
                caption={`Table 1: percentage of households classified as 'deprived in 4 dimensions' – ${locationNames.LALabel} LA, ${tableColumnHeaders.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
                source={
                  'Census 2021 from the Office for National Statistics (ONS)'
                }
                columnHeaders={tableColumnHeaders}
                rowHeaders={{
                  perc_households_deprivation_deprived:
                    'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
                }}
                data={filteredDemographicData}
                showCareProvider={false}
                percentageRows={['perc_households_deprivation_deprived']}
                showAverageLabel={false}
              ></DataTable>
            </>
          }
          download={
            <>
              {renderComparatorControl('comparator-download-1')}
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="households_deprived_in_4_dimensions.csv"
                xLabel=""
                downloadType="percentage of households classified as 'deprived in 4 dimensions'"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_deprivation_deprived' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_deprivation_deprived' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              peerData={
                dataByMetric['perc_households_deprivation_deprived'] ?? null
              }
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-1')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
            />
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Households where the property is owned outright"
        dataInfo={
          <>
            <p className="govuk-body-m">
              This is when the property does not have an outstanding mortgage or
              any other type of loan attached to it.
            </p>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/households-where-property-is-owned-outright'
                )}
                className="govuk-link"
              >
                how data on property ownership is collected
              </a>
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
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <DataTable
                tableref={tableref2}
                caption={`Table 2: percentage of households where the property is owned outright – ${locationNames.LALabel} LA, ${tableColumnHeaders.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
                source={
                  'Census 2021 from the Office for National Statistics (ONS)'
                }
                columnHeaders={tableColumnHeaders}
                rowHeaders={{
                  perc_household_ownership:
                    'Percentage of households where the property is owned outright',
                }}
                data={filteredDemographicData}
                showCareProvider={false}
                percentageRows={['perc_household_ownership']}
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
                filename="property_owned_outright.csv"
                xLabel=""
                downloadType="percentage of households where the property is owned outright"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_household_ownership' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_household_ownership' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              peerData={dataByMetric['perc_household_ownership'] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-2')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription="the percentage of households where the property is owned outright"
              figureTitle="Percentage of households where the property is owned outright"
              figureNumber={2}
            />
          }
        />
      </DataBox>
      <DataBox
        dataTitle="One-person households where the person is aged 65 or over"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/one-person-households-where-person-aged-65-or-over'
                )}
                className="govuk-link"
              >
                how the percentage of one-person households where the person is
                aged 65 or over is calculated
              </a>
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
          id="3"
          table={
            <>
              {renderComparatorControl('comparator-table-3')}
              <DataTable
                tableref={tableref3}
                caption={`Table 3: percentage of one-person households where the person is aged 65 or over – ${locationNames.LALabel} LA, ${tableColumnHeaders.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
                source={
                  'Census 2021 from the Office for National Statistics (ONS)'
                }
                columnHeaders={tableColumnHeaders}
                rowHeaders={{
                  perc_households_one_person:
                    'Percentage of one-person households where the person is aged 65 or over',
                }}
                data={filteredDemographicData}
                showCareProvider={false}
                percentageRows={['perc_households_one_person']}
                showAverageLabel={false}
              ></DataTable>
            </>
          }
          download={
            <>
              {renderComparatorControl('comparator-download-3')}
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="one_person_households_over_65.csv"
                xLabel=""
                downloadType="percentage of one-person households where the person is aged 65 or over"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_one_person' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_one_person' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              peerData={dataByMetric['perc_households_one_person'] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-3')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription="the percentage of one-person households where the person is aged 65 or over"
              figureTitle="Percentage of one-person households where the person is aged 65 or over"
              figureNumber={3}
            />
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Households &lsquo;deprived in 4 dimensions&rsquo;"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url="/help/household-deprivation"
        />
        <DataLinkCard
          label="Households where the property is owned outright"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url="/help/households-where-property-is-owned-outright"
        />
        <DataLinkCard
          label="One-person households where the person is aged 65 or over"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url="/help/one-person-households-where-person-aged-65-or-over"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence"
          description="Data estimates for undiagnosed dementia."
          url="/topics/population-needs/dementia-prevalence/data"
        />
        <DataLinkCard
          label="General health and disability"
          description="Data on disability prevalence, learning disability diagnoses and reasons for accessing care."
          url="/topics/population-needs/disability-prevalence/data"
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
