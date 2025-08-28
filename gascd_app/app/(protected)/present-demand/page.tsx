'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { Indicator } from '@/data/interfaces/Indicator';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import TableService from '@/services/Table/TableService';
import DataTable from '@/components/tables/table';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import { useSession } from 'next-auth/react';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { MetaData } from '@/data/interfaces/MetaData';
import { Locations } from '@/data/interfaces/Locations';
import { MSPItem, MSPLookup } from '@/helpers/msp/msp-lookup';
import Feedback from '@/components/common/feedback/Feedback';

const PresentDemandPage: React.FC = () => {
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);
  const { data: session, status } = useSession();
  const [filteredBedData, setFilteredBedData] = useState<Indicator[]>([]);
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [locationNamesCP, setLocationNamesCP] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [locationIdsCP, setLocationIdsCP] = useState<string[]>([]);
  const [localAuthorityData, setLocalAuthorityData] = useState<Locations>();
  const [mspData, setMspData] = useState<MSPItem>();
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [bedsQuery, setBedsQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  const [careProviderDataQuery1, setCareProviderData1Query] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [careProviderDataQuery2, setCareProviderData2Query] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const demographicMetricIds = [
    'total_population',
    'perc_18_64',
    'perc_65over',
    'perc_75over',
    'perc_85over',
    'perc_population_disability_disabled_total',
    'perc_households_deprivation_deprived_total',
    'perc_household_ownership_total',
    'perc_households_one_person_total',
    'perc_unpaid_care_provider_total',
    'perc_general_health_total',
    'learning_disabilty_prevalence',
    'dementia_estimated_diagnosis_rate_65over',
    'dementia_qof_prevalence',
  ];

  const bedsMetricIds = [
    'bedcount_per_100000_adults_total',
    'median_occupancy_total',
  ];

  const careProviderMetricIds1 = ['bedcount_total', 'occupancy_rate_total'];
  const careProviderMetricIds2 = [
    'median_bed_count_total',
    'median_occupancy_total',
  ];

  const bedRowHeaders = {
    bedcount_per_100000_adults_total: 'Beds per 100,000 adult population',
    median_occupancy_total: 'Percentage of beds occupied',
  };

  const careProviderRowHeaders = {
    median_bed_count_total: 'Beds in care provider location',
    median_occupancy_total: 'Percentage of beds occupied',
  };

  const careProviderMedianMetrics: Record<string, string> = {
    median_bed_count_total: 'bedcount_total',
    median_occupancy_total: 'occupancy_rate_total',
  };

  const cleanupLocationIDs = (location_ids_to_clean: string[]) => {
    // XXX Ideally the functions using this would use a different list of location IDs which didn't have
    // the 'Filter' word crowbarred into it from the Present Demand service.
    return location_ids_to_clean.filter((item) => item !== 'Filter');
  };

  useEffect(() => {
    const fetchCareProviderLocationName = async () => {
      const storedLocationId = localStorage.getItem('selectedValue');
      if (storedLocationId) {
        setCPLocationId(storedLocationId);
      } else if (session) {
        if (session.user.locationType == 'Care provider') {
          const locationId = await PresentDemandService.getDefaultCPLocation(
            session.user.locationId ?? ' ',
            session.user.locationType
          );
          localStorage.setItem('selectedValue', locationId);
          setCPLocationId(locationId);
        } else {
          const locationId = session.user?.locationId;
          localStorage.setItem('selectedValue', locationId!);
          setCPLocationId(locationId);
        }
      }
    };
    fetchCareProviderLocationName();
  }, [session]);

  useEffect(() => {
    const fetchMetadataByType = async () => {
      try {
        setMetricDataType(
          await IndicatorFetchService.getMetadateByType('Percentage')
        );
      } catch (error) {
        console.error('Error fetching metadata types:', error);
      }
    };
    fetchMetadataByType();
  }, []);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await PresentDemandService.getLocationNames(
            CPLocationId,
            false
          );
          const locationNamesCP = await PresentDemandService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNames(locationNames);
          setLocationNamesCP(locationNamesCP);

          // XXX why do we need to call this quite so many times?
          const laData = await PresentDemandService.getLocations(CPLocationId);
          setLocalAuthorityData(laData);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await PresentDemandService.getLocationIds(
            CPLocationId,
            false
          );
          const locationIdsCP = await PresentDemandService.getLocationIds(
            CPLocationId,
            true
          );
          setLocationIds(locationids);
          setLocationIdsCP(locationIdsCP);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setDemographicQuery(() => ({
        metric_ids: demographicMetricIds,
        location_ids: cleanupLocationIDs(locationIds),
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setBedsQuery(() => ({
        metric_ids: bedsMetricIds,
        location_ids: cleanupLocationIDs(locationIds),
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    if (CPLocationId) {
      setCareProviderData1Query(() => ({
        metric_ids: careProviderMetricIds1,
        location_ids: [CPLocationId],
      }));
    }
    if (locationIds.length) {
      setCareProviderData2Query(() => ({
        metric_ids: careProviderMetricIds2,
        location_ids: cleanupLocationIDs(locationIds),
      }));
    }
  }, [CPLocationId, locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setFilteredDemographicData(filteredDemographicData);
        const bedData: Indicator[] =
          await IndicatorFetchService.getData(bedsQuery);
        const filteredBedData = TableService.filterDate(bedData);
        setFilteredBedData(filteredBedData);
        const CPData: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery1
        );
        const CPData2: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery2
        );
        //const data1: Indicator[] = TableService.filterDate(CPData);
        //const data2: Indicator[] = TableService.filterDate(CPData2);
        const comboData: Indicator[] = [...CPData, ...CPData2];
        const filteredCPData = TableService.filterDate(comboData);
        setFinalCpData(filteredCPData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery]);

  useEffect(() => {
    if (localAuthorityData?.la_code) {
      const msp = MSPLookup[localAuthorityData.la_code];
      if (msp) {
        setMspData(msp);
      }
    }
  }, [localAuthorityData]);

  const contentItems = [
    { link: '#summary', heading: 'Introduction' },
    { link: '#selected-locations', heading: 'Your selected locations' },
    { link: '#drivers', heading: 'Drivers of population needs' },
    {
      link: '#capacity-la',
      heading: 'Current capacity - care homes: local authority-level insights',
    },
    {
      link: '#capacity-cp',
      heading: 'Current capacity - care homes: care provider-level insights',
    },
    {
      link: '#definition',
      heading: 'Indicator definitions and supporting information',
    },
    {
      link: '#market-position-statement',
      heading: 'Find more information on your local care market',
    },
    {
      link: '#feedback',
      heading: 'Give your feedback',
    },
  ];

  // Re-usable way to create multiple demographic tables
  // from the same data, but displaying different rows
  type DemoGraphicTableProps = {
    caption: string;
    headers: {};
    source: string;
    children?: React.ReactElement;
  };
  const DemoGraphicTable: React.FC<DemoGraphicTableProps> = ({
    caption,
    headers,
    source,
    children,
  }) => {
    return (
      <DataTable
        caption={caption}
        columnHeaders={locationNames}
        rowHeaders={headers}
        data={filteredDemographicData}
        showCareProvider={false}
        percentageRows={metricDateType}
        source={source}
      >
        {children}
      </DataTable>
    );
  };

  return (
    <>
      <Layout
        title="Current population needs and capacity"
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="present-demand"
        backURL="/"
        showNavBar={false}
        session={session}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <ContentSidePanel items={contentItems} />
          </div>
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-!-margin-bottom-9">
              <h1 className="govuk-heading-l">
                Current population needs and capacity
              </h1>
              <h2 className="govuk-heading-m" id="summary">
                Introduction
              </h2>
              <p className="govuk-body">
                Understanding current population needs and capacity for adult
                social care services helps identify where needs are being met
                and where gaps may exist.
              </p>
              <p className="govuk-body">
                Here you can explore factors driving local population needs and
                find insights into current capacity to meet those needs.
              </p>
            </div>

            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-m" id="selected-locations">
                Your selected locations
              </h2>
              <p className="govuk-body">
                Select locations to view and compare data.
              </p>
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row govuk-!-margin-bottom-9">
                  <dt className="govuk-summary-list__key">
                    Selected locations
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {locationNamesCP && (
                      <p data-testid="location-names">
                        {locationNamesCP.slice(1).join(', ')}
                      </p>
                    )}
                  </dd>
                  <dd className="govuk-summary-list__actions">
                    <a className="govuk-link" href="/present-demand-locations">
                      Change<span className="govuk-visually-hidden"> name</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="govuk-heading-m" id="drivers">
                Drivers of population needs
              </h2>
              <p className="govuk-body">
                Population needs for adult social care are influenced by a range
                of factors, including the population&apos;s age structure,
                disability profile and rate of dementia diagnosis.
              </p>
              <p className="govuk-body">
                Areas with a higher proportion of older adults, people with
                disabilities or rates of dementia diagnosis typically experience
                greater pressure on services.
              </p>
              <ConditionalText
                data={filteredDemographicData}
                ColumnHeaders={locationNames}
                section="Drivers"
                locations={locationNames}
                metric_Id="perc_65over"
              ></ConditionalText>
            </div>
            <div>
              <DemoGraphicTable
                caption={`Table comparing population size and age in ${locationNames[1]} to regional and national statistics`}
                source={`Source: Population estimates from the Office for National Statistics (ONS)`}
                headers={{
                  total_population: 'Total adult population',
                  perc_18_64: 'Aged 18 to 64',
                  perc_65over: 'Aged 65 and over',
                  perc_75over: 'Aged 75 and over',
                  perc_85over: 'Aged 85 and over',
                }}
              />
            </div>

            <div>
              <DemoGraphicTable
                caption={`Table comparing economic indicators in ${locationNames[1]} to regional and national statistics`}
                source={
                  'Source: Census 2021 from the Office for National Statistics (ONS)'
                }
                headers={{
                  perc_household_ownership_total:
                    'Households where the property is owned outright (with no mortgage)',
                  perc_households_deprivation_deprived_total:
                    "Households that are 'deprived in 4 dimensions'",
                }}
              >
                <details className="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      What &lsquo;deprived in 4 dimensions&rsquo; means
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    A household is &lsquo;deprived in 4 dimensions&lsquo; if all
                    the following apply:<p></p>
                    <ul className="govuk-list govuk-list--bullet govuk-list--spaced">
                      <li>
                        no one in the household has at least level 2 education
                        and no one aged 16 to 18 years is a full-time student
                      </li>
                      <li>
                        any household member is unemployed or economically
                        inactive due to long-term sickness or disability, and is
                        not a full-time student
                      </li>
                      <li>any household member is disabled</li>
                      <li>
                        the household&apos;s accommodation is overcrowded, in a
                        shared dwelling or has no central heating
                      </li>
                    </ul>
                  </div>
                </details>
              </DemoGraphicTable>
            </div>

            <div>
              <DemoGraphicTable
                caption={`Table comparing the age of one-person households and unpaid care provision in ${locationNames[1]} to regional and national statistics`}
                source={`Source: Census 2021 from the Office for National Statistics (ONS)`}
                headers={{
                  perc_households_one_person_total:
                    'Percentage of one-person households where the person is aged 65 or over',
                  perc_unpaid_care_provider_total:
                    'Percentage of people aged 5 or over who provide unpaid care',
                }}
              />
            </div>

            <div>
              <DemoGraphicTable
                caption={`Table comparing general health reports and disability prevalence in ${locationNames[1]} to regional and national statistics`}
                source={
                  'Sources: Census 2021 from the Office for National Statistics (ONS), Fingertips public health profiles from the Department of Health and Social Care (DHSC)'
                }
                headers={{
                  perc_general_health_total:
                    'People who reported being in bad or very bad health',
                  perc_population_disability_disabled_total:
                    'Disability prevalence – people who reported a long-term physical or mental health condition or illness that limits day-to-day activities',
                  learning_disabilty_prevalence:
                    'Learning disability prevalence – all ages, as a proportion of people registered at GP practices',
                }}
              />
            </div>

            <div>
              <DemoGraphicTable
                caption={`Table comparing dementia prevalence and dementia diagnosis rate in ${locationNames[1]} to regional and national statistics`}
                source={
                  'Source: Fingertips public health profiles from the Department of Health and Social Care (DHSC)'
                }
                headers={{
                  dementia_qof_prevalence:
                    'Dementia prevalence – all ages, as a proportion of people registered at GP practices',
                  dementia_estimated_diagnosis_rate_65over:
                    "Estimated 'dementia diagnosis rate' – aged 65 and over",
                }}
              >
                <details className="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      What &lsquo;dementia diagnosis rate&rsquo; means
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    The &lsquo;dementia diagnosis rate&rsquo; is found by
                    dividing the number of people with a formal diagnosis of
                    dementia by the estimated number of people expected to have
                    dementia.<p></p>
                    <p>
                      The estimated number of people expected to have dementia
                      is worked out by combining:
                    </p>
                    <ul className="govuk-list govuk-list--bullet">
                      <li>
                        the characteristics of the local registered population
                      </li>
                      <li>studies on dementia prevalence by age and sex</li>
                    </ul>
                    <a
                      href="https://fingertips.phe.org.uk/dementia#page/6/gid/1938132811/ati/15/iid/92949/age/27/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1"
                      className="govuk-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Details on how &lsquo;dementia diagnosis rate&rsquo; is
                      calculated (opens in new tab).
                    </a>
                    <p></p>
                  </div>
                </details>
              </DemoGraphicTable>
            </div>

            <div className="">
              <h2
                className="govuk-heading-m govuk-!-margin-top-9"
                id="capacity-la"
              >
                Current capacity - care homes: local authority-level insights
              </h2>
              <p className="govuk-body">
                The number of adult social care beds per 100,000 adult
                population provides an indicator of current care capacity. A
                higher number suggests more sufficient capacity.
              </p>
              <p className="govuk-body">
                Care homes in {locationNames[1]} have{' '}
                <strong>
                  {filteredBedData.find(
                    (metric) =>
                      metric.metric_id === 'bedcount_per_100000_adults_total' &&
                      metric.location_type === 'LA'
                  )?.data_point ?? 'Loading...'}{' '}
                  beds per 100,000 adult population
                </strong>
                , compared to the {locationNames[2]} average of{' '}
                {filteredBedData.find(
                  (metric) =>
                    metric.metric_id === 'bedcount_per_100000_adults_total' &&
                    metric.location_type === 'Regional'
                )?.data_point ?? 'Loading...'}{' '}
                per 100,000.
              </p>
              <ConditionalText
                data={filteredBedData}
                ColumnHeaders={locationNames}
                section="CapacityLA"
                locations={locationNames}
                metric_Id="median_occupancy_total"
              ></ConditionalText>
            </div>
            <div className="govuk-!-margin-bottom-9">
              <p className="govuk-body">
                {' '}
                You can filter this data by type of beds
              </p>
              <form action="/metric/total-beds">
                <button
                  type="submit"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                >
                  Explore data
                </button>
              </form>
              <DataTable
                caption={`Table comparing provision of adult social care beds and occupancy levels in ${locationNames[1]} to regional and national statistics`}
                source={
                  'Source: Capacity Tracker from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={locationNames}
                rowHeaders={bedRowHeaders}
                data={filteredBedData}
                showCareProvider={false}
                percentageRows={metricDateType}
              ></DataTable>
            </div>

            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-m" id="capacity-cp">
                Current capacity - care homes: care provider-level insights
              </h2>
              <p className="govuk-body">
                Examining individual care providers offers insight into how
                their capacity compares with other care providers at local
                authority, regional and national level.
              </p>
              <p className="govuk-body">
                {locationNamesCP[1]} is a provider with{' '}
                <strong>
                  {finalCpData.find(
                    (metric) =>
                      metric.metric_id === 'bedcount_total' &&
                      metric.location_type === 'Care provider location'
                  )?.data_point ?? 'Loading...'}{' '}
                </strong>
                total beds, compared to the median (
                {finalCpData.find(
                  (metric) =>
                    metric.metric_id === 'median_bed_count_total' &&
                    metric.location_type === 'Regional'
                )?.data_point ?? 'Loading...'}{' '}
                beds) in {locationNamesCP[2]}.
              </p>
              <ConditionalText
                data={finalCpData}
                ColumnHeaders={locationNamesCP}
                section="CapacityCareProvider"
                locations={locationNamesCP}
                metric_Id="median_occupancy_total"
              ></ConditionalText>
              <p className="govuk-body">
                <strong>Note: </strong>If a care provider location has fewer
                than 6 beds, the number of beds is shown as 0. If a care
                provider location has fewer than 6 beds occupied, the percentage
                of beds occupied is shown as 0. For details on suppression of
                data, see indicator definition and supporting information.
              </p>
              <DataTable
                caption={`Table comparing provision at the care provider location to median numbers of care beds at local, regional and national levels`}
                source={
                  'Source: Capacity Tracker from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={locationNamesCP}
                rowHeaders={careProviderRowHeaders}
                data={finalCpData}
                showCareProvider={true}
                careProviderMedianMetrics={careProviderMedianMetrics}
                percentageRows={metricDateType}
              ></DataTable>
            </div>

            <h2
              className="govuk-heading-m govuk-!-margin-top-9"
              id="definition"
            >
              Indicator definitions and supporting information
            </h2>
            <p className="govuk-body">
              Find detailed information about each indicator, including data
              definitions, data source, update schedule, and any limitations to
              be aware of before using the data.
            </p>

            <h3 className="govuk-heading-s">Indicators for population needs</h3>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <a href="/help/population-size" className="govuk-link">
                  Population size
                </a>
              </li>
              <li>
                <a href="/help/population-age" className="govuk-link">
                  Population age
                </a>
              </li>
              <li>
                <a
                  href="/help/households-property-owned-outright"
                  className="govuk-link"
                >
                  Households where the property is owned outright
                </a>
              </li>
              <li>
                <a
                  href="/help/households-deprived-4-dimensions"
                  className="govuk-link"
                >
                  Households deprived in 4 dimensions
                </a>
              </li>
              <li>
                <a
                  href="/help/percentage-one-person-households-65-or-over"
                  className="govuk-link"
                >
                  One-person households where the person is aged 65 or over
                </a>
              </li>
              <li>
                <a
                  href="/help/percentage-people-5-or-over-who-provide-unpaid-care"
                  className="govuk-link"
                >
                  People aged 5 or over who provide unpaid care
                </a>
              </li>
              <li>
                <a
                  href="/help/people-in-bad-or-very-bad-health"
                  className="govuk-link"
                >
                  People in bad or very bad health
                </a>
              </li>
              <li>
                <a href="/help/disability-prevalence" className="govuk-link">
                  Disability prevalence
                </a>
              </li>
              <li>
                <a
                  href="/help/learning-disability-prevalence"
                  className="govuk-link"
                >
                  Learning disability prevalence
                </a>
              </li>
              <li>
                <a href="/help/dementia-prevalence" className="govuk-link">
                  Dementia prevalence
                </a>
              </li>
              <li>
                <a
                  href="/help/estimated-dementia-diagnosis-rate-65-and-over"
                  className="govuk-link"
                >
                  Estimated dementia diagnosis rate
                </a>
              </li>
            </ul>

            <h3 className="govuk-heading-s">
              Indicators for care home capacity
            </h3>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <a
                  href="/help/beds-per-100000-adult-population"
                  className="govuk-link"
                >
                  Adult social care beds per 100,000 adult population
                </a>
              </li>
              <li>
                <a href="/help/percentage-beds-occupied" className="govuk-link">
                  Percentage of adult social care beds occupied
                </a>
              </li>
              <li>
                <a
                  href="/help/beds-care-provider-location"
                  className="govuk-link"
                >
                  Number of adult social care beds in care provider location
                </a>
              </li>
              <li>
                <a
                  href="/help/percentage-beds-occupied-care-provider-location"
                  className="govuk-link"
                >
                  Percentage of adult social care beds occupied in care provider
                  location
                </a>
              </li>
            </ul>

            <div className="govuk-!-margin-bottom-9">
              <h2
                className="govuk-heading-m govuk-!-margin-top-9"
                id="market-position-statement"
              >
                Find more information on your local care market
              </h2>
              {mspData && mspData.url && (
                <p className="govuk-body">
                  <a
                    href={mspData.url}
                    data-testid="msp-link"
                    className="govuk-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Market Position Statement for {locationNames[1]} (opens in
                    new tab)
                  </a>
                </p>
              )}
              <p className="govuk-body">
                Most local authorities in England publish Market Position
                Statements (MPS) to help care providers understand the local
                care market.
              </p>
              <p className="govuk-body">
                You can usually find these{' '}
                <abbr title="Market Position Statement">MPS</abbr> documents on
                local authority websites.
              </p>
              <p className="govuk-body">
                <abbr title="Market Position Statement">MPS</abbr> documents
                include information on:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>supply and demand in the local care market</li>
                <li>
                  forecasts of future supply and demand for adult social care
                  services
                </li>
                <li>
                  how the local authority will support the local care market to
                  meet demand
                </li>
                <li>
                  how the local authority will engage with care providers on
                  challenges in the sector, such as funding pressures
                </li>
              </ul>

              <div className="govuk-!-margin-top-9">
                <Feedback />
              </div>

              <details className="govuk-details govuk-!-margin-top-9">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    Get help with this page
                  </span>
                </summary>
                <div className="govuk-details__text">
                  If you have any issues using this service, email{' '}
                  <a
                    href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                    className="govuk-link"
                  >
                    getadultsocialcaredata.team@dhsc.gov.uk
                  </a>
                  .
                </div>
              </details>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PresentDemandPage;
