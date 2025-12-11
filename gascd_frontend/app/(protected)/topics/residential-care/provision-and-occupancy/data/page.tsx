'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
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
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';

export default function ProvisionAndOccupancyPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);
  const [locationNamesCP, setLocationNamesCP] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    CPLabel: 'Loading...',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationNamesWithAverageLabels, setLocationNamesWithAverageLabels] =
    useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  // const [laNamesForRegion, setLaNamesForRegion] = useState<string[]>();
  // const [laIdsForRegion, setLaIdsForRegion] = useState<string[]>();
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [filteredBedData, setFilteredBedData] = useState<Indicator[]>([]);
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

  const [careHomeBedNumbersDataQuery, setCareHomeBedNumbersDataQuery] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [careHomeBedTypesDataQuery, setCareHomeBedTypesDataQuery] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [selectedTableFilters, setSelectedTableFilters] = useState<string[]>([
    'Total Beds',
    'Dementia Nursing',
    'Dementia Residential',
  ]);

  const [bedTypeRowHeaders, setBedTypeRowHeaders] = useState<any>({
    bedcount_per_100000_adults_total: 'Total Beds',
    bedcount_per_100000_adults_total_dementia_nursing: 'Dementia Nursing',
    bedcount_per_100000_adults_total_dementia_residential:
      'Dementia Residential',
  });

  const bedsMetricIds = [
    'bedcount_per_100000_adults_total',
    'median_occupancy_total',
  ];
  const careProviderMetricIds1 = ['bedcount_total', 'occupancy_rate_total'];
  const careProviderMetricIds2 = [
    'median_bed_count_total',
    'median_occupancy_total',
  ];
  const careProviderMedianMetrics: Record<string, string> = {
    median_bed_count_total: 'bedcount_total',
    median_occupancy_total: 'occupancy_rate_total',
  };

  const bedTypeMetricIds = [
    'bedcount_per_100000_adults_total',
    'bedcount_per_100000_adults_total_dementia_nursing',
    'bedcount_per_100000_adults_total_dementia_residential',
  ];

  const { data: session } = authClient.useSession();

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care homes',
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
  }, [session]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNamesCP(locationNamesCP);
          setLocationNamesWithAverageLabels([
            locationNamesCP.CPLabel!,
            locationNamesCP.LALabel,
            `${locationNamesCP.RegionLabel} (regional average)`,
            `${locationNamesCP.CountryLabel} (national average)`,
          ]);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const bedData: Indicator[] = await IndicatorFetchService.getData(
          careHomeBedTypesDataQuery
        );
        const filteredBedData = TableService.filterDate(bedData);
        setFilteredBedData(filteredBedData);

        const CPData: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery1
        );
        const CPData2: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery2
        );
        // const bedNumberData: Indicator[] = await IndicatorFetchService.getData(careHomeBedNumbersDataQuery);

        const comboData: Indicator[] = [
          ...CPData,
          ...CPData2,
          ...filteredBedData,
        ];
        const filteredCPData = TableService.filterDate(comboData);
        setFinalCpData(filteredCPData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [
    careHomeBedNumbersDataQuery,
    careProviderDataQuery1,
    careProviderDataQuery2,
    CPLocationId,
  ]);

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

  // useEffect(() => {
  //   const fetchLasForRegion = async () => {
  //     if (locationIds[2]) {
  //       const las = await LocationService.getLasForRegion(locationIds[2]);
  //       let nameArray: string[] = []
  //       let idArray: string[] = []

  //       las.forEach((la: any) => {
  //         nameArray.push(la.la_name);
  //         idArray.push(la.la_code);
  //       });

  //       setLaNamesForRegion(nameArray);
  //       setLaIdsForRegion(idArray);

  //       console.log(nameArray);
  //       console.log(idArray);
  //     };
  //   };
  //   fetchLasForRegion();
  // }, [locationIds])

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
      setCareHomeBedTypesDataQuery(() => ({
        metric_ids: bedTypeMetricIds,
        location_ids: locationIds,
      }));
    }
    // if(laIdsForRegion) {
    //   setCareHomeBedNumbersDataQuery(() => ({
    //     metric_ids: ['bedcount_per_100000_adults_total'],
    //     location_ids: [locationIds[3], locationIds[2], ...laIdsForRegion],
    //   }));
    // }
  }, [CPLocationId, locationIds]);

  useEffect(() => {
    const storedData = localStorage.getItem('table-metrics');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          const ids = parsedData.map((item) => item.metric_id);
          setCareHomeBedTypesDataQuery(() => ({
            metric_ids: ['bedcount_per_100000_adults_total', ...ids],
            location_ids: locationIds,
          }));
          const map: any = {};
          parsedData.map((item) => (map[item.metric_id] = item.filter_bedtype));
          setBedTypeRowHeaders(map);
          if (parsedData) {
            const tMetricNames = parsedData.map((obj) => obj['filter_bedtype']);
            setSelectedTableFilters(tMetricNames);
          } else {
            setSelectedTableFilters(bedTypeMetricIds);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setCareHomeBedTypesDataQuery({
        metric_ids: bedTypeMetricIds,
        location_ids: locationIds,
      });
    }
  }, [locationIds]);

  return (
    <Layout
      title="Provision and occupancy"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="provision-and-occupancy"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Care home beds and occupancy levels
          </h1>
          <p className="govuk-body-l">
            Provision and capacity data for care homes, including local,
            regional and national statistics.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      {/* <DataBox
        dataTitle="Care home bed numbers"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href="/help/beds-per-100000-adult-population"
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population is calculated.
            </a>
          </>
        }
      >
        <DataTabs
          id="1"
          table={
            <DataTable
              caption={`Table 1: care home bed numbers per 100,000 adult population for regional local authorities -
                ${locationNamesCP.RegionLabel}, October 2025`}
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={['Area', 'Care home beds per 100,000 adult population']}
              rowHeaders={[]}
              data={finalCpData}
              showCareProvider={false}
              percentageRows={[]}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox> */}
      <DataBox
        dataTitle="Care home bed types"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href="/help/beds-per-100000-adult-population"
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population
            </a>{' '}
            are calculated.
          </>
        }
      >
        <table className="govuk-table">
          <tbody className="govuk-table__body">
            <tr className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                Filter
              </th>
              <td className="govuk-table__cell">
                <ul className="govuk-!-margin-top-0 nobullet">
                  {selectedTableFilters.map((filter, index) => (
                    <li key={index}>{filter}</li>
                  ))}
                </ul>
              </td>
              <td className="govuk-table__cell">
                <a
                  href="/topics/residential-care/provision-and-occupancy/filters"
                  className="govuk-link"
                >
                  Change
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <DataTabs
          id="2"
          table={
            <DataTable
              tableref={tableref2}
              caption={`Table 2: care home bed numbers per 100,000 adult population – ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, October
                2025`}
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={bedTypeRowHeaders}
              data={finalCpData}
              showCareProvider={false}
              careProviderMedianMetrics={careProviderMedianMetrics}
              percentageRows={[]}
            ></DataTable>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <p className="govuk-body">
                The number of adult social care beds per 100,000 adult
                population provides an indicator of current care capacity. A
                higher number suggests more sufficient capacity.
              </p>
              <p className="govuk-body">
                Care homes in {locationNamesCP.LALabel} have{' '}
                <strong>
                  {finalCpData.find(
                    (metric) =>
                      metric.metric_id === 'bedcount_per_100000_adults_total' &&
                      metric.location_type === 'LA'
                  )?.data_point ?? 'Loading...'}{' '}
                  beds per 100,000 adult population
                </strong>
                , compared to the {locationNamesCP.RegionLabel} regional average
                of{' '}
                {finalCpData.find(
                  (metric) =>
                    metric.metric_id === 'bedcount_per_100000_adults_total' &&
                    metric.location_type === 'Regional'
                )?.data_point ?? 'Loading...'}{' '}
                per 100,000.
              </p>
            </>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="care_home_bed_types.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Beds per care home and occupancy levels"
        dataInfo={
          <p className="govuk-body-m">
            Find out how{' '}
            <a href="/help/percentage-beds-occupied" className="govuk-link">
              occupancy level percentages
            </a>{' '}
            and{' '}
            <a href="/help/beds-care-provider-location" className="govuk-link">
              number of adult social care beds in a care provider location
            </a>{' '}
            are calculated.
          </p>
        }
      >
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Definition of a &lsquo;median&rsquo; number
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              If you place a set of numbers in order, the middle one of the set
              is the median number.
            </p>
            <p>
              When there are two middle numbers, the median is the average of
              those two numbers.
            </p>
          </div>
        </details>
        <DataTabs
          id="3"
          table={
            <DataTable
              tableref={tableref3}
              caption={`Table 3: care home bed numbers and occupancy levels – 
                ${locationNamesCP.CPLabel}, ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, October
                2025`}
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={{
                median_bed_count_total: 'Beds per care home',
                median_occupancy_total: 'Occupancy level',
              }}
              data={finalCpData}
              showCareProvider={true}
              careProviderMedianMetrics={careProviderMedianMetrics}
              percentageRows={['median_occupancy_total']}
              showAverageLabel={true}
            ></DataTable>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <p className="govuk-body">
                {locationNamesCP.CPLabel} is a provider with{' '}
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
                beds) in {locationNamesCP.LALabel}.
              </p>
              <ConditionalText
                data={finalCpData}
                ColumnHeaders={locationNamesCP}
                section="CapacityCareProvider"
                metric_Id="median_occupancy_total"
              ></ConditionalText>
              <ConditionalText
                data={filteredBedData}
                ColumnHeaders={locationNamesCP}
                section="CapacityLA"
                metric_Id="median_occupancy_total"
              ></ConditionalText>
            </>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="care_home_bed_numbers_and_occupancy.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/beds-per-100000-adult-population"
        />
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population - over time"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/beds-per-100000-adult-population-over-time"
        />
        <DataLinkCard
          label="Occupancy level percentages for adult social care beds"
          sources="Capacity Tracker"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/percentage-beds-occupied"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNamesCP.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
