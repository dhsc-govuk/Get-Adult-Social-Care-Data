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
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { MetaData } from '@/data/interfaces/MetaData';
import { Locations } from '@/data/interfaces/Locations';
import { MSPItem, MSPLookup } from '@/helpers/msp/msp-lookup';

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
  const [demographicDataSource, setDemographicDataSource] = useState<string>();
  const [bedsDataSource, setBedsDataSource] = useState<string>();
  const [CPDataSource, setCPDataSource] = useState<string>();
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);
  const [demographicLatestDate, setDemographicLatestDate] = useState<
    string | null
  >();
  const [bedDataLatestDate, setBedDataLatestDate] = useState<string | null>();
  const [CPLatestDate, setCPLatestDate] = useState<string | null>();
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
    'dementia_register_65over_per100k',
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

  const demographicRowHeaders = {
    total_population: 'Population',
    perc_18_64: 'Aged 18-65',
    perc_65over: 'Aged 65 and over',
    perc_75over: 'Aged 75 and over',
    perc_85over: 'Aged 85 and over',
    perc_population_disability_disabled_total: 'Disability prevalence',
    dementia_register_65over_per100k:
      'Registered dementia patients per 100,000',
  };

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

  const metrics_require_percentage = [
    'perc_18_64',
    'perc_65over',
    'perc_75over',
    'perc_85over',
    'perc_population_disability_disabled_total',
    'median_occupancy_total',
    'median_occupancy_total',
  ];

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
          console.log(locationids, locationIdsCP);
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
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setBedsQuery(() => ({
        metric_ids: bedsMetricIds,
        location_ids: locationIds,
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
        location_ids: locationIds,
      }));
    }
  }, [CPLocationId, locationIds]);

  useEffect(() => {
    if (filteredDemographicData.length > 0) {
      setDemographicLatestDate(
        PresentDemandService.getMostRecentDate(filteredDemographicData)
      );
    }
    if (filteredBedData.length > 0) {
      setBedDataLatestDate(
        PresentDemandService.getMostRecentDate(filteredBedData)
      );
    }
    if (finalCpData.length > 0) {
      setCPLatestDate(PresentDemandService.getMostRecentDate(finalCpData));
    }
  }, [filteredDemographicData, filteredBedData, finalCpData]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setFilteredDemographicData(filteredDemographicData);
        setDemographicDataSource(
          await PresentDemandService.getDataSource(demographicQuery)
        );
        const bedData: Indicator[] =
          await IndicatorFetchService.getData(bedsQuery);
        const filteredBedData = TableService.filterDate(bedData);
        setFilteredBedData(filteredBedData);
        setBedsDataSource(await PresentDemandService.getDataSource(bedsQuery));
        const CPData: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery1
        );
        const CPData2: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery2
        );
        const data1: Indicator[] = TableService.filterDate(CPData);
        const data2: Indicator[] = TableService.filterDate(CPData2);
        const comboData: Indicator[] = [...CPData, ...CPData2];
        const filteredCPData = TableService.filterDate(comboData);
        setCPDataSource(
          await PresentDemandService.getDataSource(
            careProviderDataQuery1,
            careProviderDataQuery2
          )
        );
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
    {
      link: '#definition',
      heading: 'Indicator definition and supporting information',
    },
    { link: '#selected-locations', heading: 'Your selected locations' },
    {
      link: '#capacity-la',
      heading: 'Current capacity - care homes: local authority-level insights',
    },
    {
      link: '#capacity-cp',
      heading: 'Current capacity - care homes: care provider-level insights',
    },
    {
      link: '#market-position-statement',
      heading: 'Find more information on your local care market',
    },
  ];

  return (
    <>
      <Layout
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
              <h2 className="govuk-heading-m" id="definition">
                Indicator definition and supporting information
              </h2>
              <p className="govuk-body">
                Find detailed information about each indicator, including data
                definitions, data source, update schedule, and any limitations
                to be aware of before using the data.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <a href="/help/population-age" className="govuk-link">
                    Population age
                  </a>
                </li>
                <li>
                  <a href="/help/disability-prevalence" className="govuk-link">
                    Population disability
                  </a>
                </li>
                <li>
                  <a
                    href="/help/beds-per-100000-adult-population"
                    className="govuk-link"
                  >
                    Adult social care beds per 100,000 adult population
                  </a>
                </li>
                <li>
                  <a
                    href="/help/percentage-beds-occupied"
                    className="govuk-link"
                  >
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
                    Percentage of adult social care beds occupied in care
                    provider location
                  </a>
                </li>
              </ul>
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
                    <p>{locationNamesCP.slice(1).join(', ')}</p>
                  </dd>
                  <dd className="govuk-summary-list__actions">
                    <a className="govuk-link" href="/present-demand-locations">
                      Change<span className="govuk-visually-hidden"> name</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l" id="drivers">
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
            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-9">
                Explore the data: demographic factors
              </h2>
              <DataTable
                columnHeaders={locationNames}
                rowHeaders={demographicRowHeaders}
                data={filteredDemographicData}
                showCareProvider={false}
                percentageRows={metricDateType}
              ></DataTable>
              <DownloadTableDataCSVLink
                data={TableService.removeLoadDateTime(filteredDemographicData)}
                filename="Demographic factors"
                xLabel=""
              ></DownloadTableDataCSVLink>
              <p className="govuk-body govuk-!-margin-bottom-9">
                Source: {demographicDataSource}
                <br />
                Data correct as of {demographicLatestDate}
              </p>
            </div>

            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l" id="capacity-la">
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
              <h2 className="govuk-heading-m">
                Explore the data: adult social care beds per 100,000 adult
                population and occupancy
              </h2>
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
                columnHeaders={locationNames}
                rowHeaders={bedRowHeaders}
                data={filteredBedData}
                showCareProvider={false}
                percentageRows={metricDateType}
              ></DataTable>
              <DownloadTableDataCSVLink
                data={TableService.removeLoadDateTime(filteredBedData)}
                filename="Current Capacity"
                xLabel=""
              ></DownloadTableDataCSVLink>
              <p className="govuk-body govuk-!-margin-bottom-9">
                Source: {bedsDataSource}
                <br />
                Data correct as of {bedDataLatestDate}
              </p>
            </div>
            <div className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l" id="capacity-cp">
                Current capacity - care homes: care provider-level insights
              </h2>
              <p className="govuk-body">
                Examining individual care providers offers insight into how
                their capacity compares with other care providers at local
                authority, regional and national level.
              </p>
              <p className="govuk-body">
                {locationNamesCP[1]} is a provider with (
                {finalCpData.find(
                  (metric) =>
                    metric.metric_id === 'bedcount_total' &&
                    metric.location_type === 'Care provider location'
                )?.data_point ?? 'Loading...'}{' '}
                beds) in {locationNamesCP[2]} total beds, compared to the
                average (
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
              <h2 className="govuk-heading-m">
                Explore the data: care providers in {locationNames[1]}
              </h2>
              <DataTable
                columnHeaders={locationNamesCP}
                rowHeaders={careProviderRowHeaders}
                data={finalCpData}
                showCareProvider={true}
                careProviderMedianMetrics={careProviderMedianMetrics}
                percentageRows={metricDateType}
              ></DataTable>
              <DownloadTableDataCSVLink
                data={TableService.removeLoadDateTime(finalCpData)}
                filename="Care providers data"
                xLabel=""
              ></DownloadTableDataCSVLink>
              <p className="govuk-body">
                Source: {CPDataSource}
                <br />
                Data correct as of {CPLatestDate}
              </p>
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
                Every local authority in England must produce a Market Position
                Statement (MPS) to comply with their duties under the Care Act
                2014. You can usually find these on the local authority website.
              </p>
              <p className="govuk-body">MPSs include information on:</p>
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
                  potential business opportunities for current or prospective
                  care providers
                </li>
              </ul>
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
