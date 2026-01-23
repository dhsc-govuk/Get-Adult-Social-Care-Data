'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useRef, useState } from 'react';
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
import BarChart from '@/components/charts/BarChart';
import VerticalLocationTable from '@/components/tables/VerticalLocationTable';
import TimeSeriesChart, {
  DataPoint,
  Series,
} from '@/components/charts/TimeSeriesChart';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';

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
    useState<LocationNames>({
      IndicatorLabel: 'Indicator',
      CPLabel: 'Loading...',
      LALabel: 'Loading...',
      RegionLabel: 'Loading...',
      CountryLabel: 'Loading...',
    } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [lasForRegion, setLasForRegion] = useState<string[]>();
  const [laIdsForRegion, setLaIdsForRegion] = useState<string[]>();
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [filteredBedTypeData, setFilteredBedTypeData] = useState<Indicator[]>(
    []
  );
  const [allBedTypeData, setAllBedTypeData] = useState<Indicator[]>([]);
  const [filteredBedNumbersData, setFilteredBedNumbersData] = useState<
    Indicator[]
  >([]);

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

  const [selectedBedTypeTableFilters, setSelectedBedTypeTableFilters] =
    useState<string[]>([
      'All bed types',
      'Dementia nursing',
      'Dementia residential',
    ]);

  const [selectedBedNumberTableFilter, setSelectedBedNumberTableFilter] =
    useState<string[]>(['All bed types']);

  const [bedTypeRowHeaders, setBedTypeRowHeaders] = useState<any>({
    bedcount_per_hundred_thousand_adults_total: 'All bed types',
    bedcount_per_hundred_thousand_adults_total_dementia_nursing:
      'Dementia nursing',
    bedcount_per_hundred_thousand_adults_total_dementia_residential:
      'Dementia residential',
  });

  const [bedNumberRowHeaders, setBedNumberRowHeaders] = useState<Object[]>([]);

  const careProviderMetricIds1 = ['bedcount_total', 'occupancy_rates_total'];
  const careProviderMetricIds2 = [
    'median_bed_count_total',
    'median_occupancy_total',
  ];
  const careProviderMedianMetrics: Record<string, string> = {
    median_bed_count_total: 'bedcount_total',
    median_occupancy_total: 'occupancy_rates_total',
  };

  const bedTypeMetricIds = [
    'bedcount_per_hundred_thousand_adults_total',
    'bedcount_per_hundred_thousand_adults_total_dementia_nursing',
    'bedcount_per_hundred_thousand_adults_total_dementia_residential',
  ];

  const bedNumberMetricIds = ['bedcount_per_hundred_thousand_adults_total'];
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care provision',
      url: '/topics/residential-care/subtopics',
    },
  ];

  const trackDefaultMetrics = () => {
    // Track all of the key metrics shown on this page
    // note - does not include filters, which are tracked as separate events
    careProviderMetricIds1.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
    careProviderMetricIds2.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
    bedNumberMetricIds.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
  };

  const [chartData, setChartData] = useState<{
    categories: string[];
    values: number[];
  }>({ categories: [], values: [] });
  useEffect(() => {
    let categories: string[] = [];
    let values: number[] = [];
    Object.entries(bedNumberRowHeaders).map((header: any) => {
      categories.push(header[1]);
      const datapoints = filteredBedNumbersData.filter(
        (item) => item.location_id === header[0]
      );
      if (datapoints.length) {
        values.push(datapoints[0].data_point);
      }
    });
    setChartData({
      categories: categories,
      values: values,
    });
  }, [bedNumberRowHeaders, filteredBedNumbersData]);

  useEffect(() => {
    // Get Selected location from user
    const fetchSelectedLocation = async () => {
      const userLocationId = await LocationService.getSelectedLocation();
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      setCPLocationId(userLocationId);
    };
    fetchSelectedLocation();
    trackDefaultMetrics();
  }, []);

  useEffect(() => {
    // Look up the related names for the current location
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNamesCP(locationNamesCP);
          setLocationNamesWithAverageLabels({
            IndicatorLabel: 'Care home bed type',
            CPLabel: locationNamesCP.CPLabel!,
            LALabel: locationNamesCP.LALabel,
            RegionLabel: `${locationNamesCP.RegionLabel} (regional average)`,
            CountryLabel: `${locationNamesCP.CountryLabel} (national average)`,
          });
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    // Fetch all metric data based on set queries
    const fetchAllData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedTypesDataQuery.location_ids.length) {
          const bedTypeData: Indicator[] = await IndicatorFetchService.getData(
            careHomeBedTypesDataQuery
          );
          setAllBedTypeData(bedTypeData);
          const filteredBedTypeData = TableService.filterDate(bedTypeData);
          setFilteredBedTypeData(filteredBedTypeData);
        }

        if (careHomeBedNumbersDataQuery.location_ids.length) {
          const bedNumberData: Indicator[] =
            await IndicatorFetchService.getData(careHomeBedNumbersDataQuery);
          const filteredBedNumbersData = TableService.filterDate(bedNumberData);
          setFilteredBedNumbersData(filteredBedNumbersData);
        }

        if (
          careProviderDataQuery1.location_ids.length &&
          careProviderDataQuery2.location_ids.length
        ) {
          const CPData: Indicator[] = await IndicatorFetchService.getData(
            careProviderDataQuery1
          );
          const CPData2: Indicator[] = await IndicatorFetchService.getData(
            careProviderDataQuery2
          );
          const comboData: Indicator[] = [...CPData, ...CPData2];
          const filteredCPData = TableService.filterDate(comboData);
          setFinalCpData(filteredCPData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [
    careHomeBedTypesDataQuery,
    careHomeBedNumbersDataQuery,
    careProviderDataQuery1,
    careProviderDataQuery2,
  ]);

  useEffect(() => {
    // Get location IDs for the selected location
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
    // Get LA data for the current region
    const fetchLasForRegion = async () => {
      if (locationIds.length) {
        const las = await LocationService.getLasForRegion(locationIds[2]);
        let idArray: string[] = [];

        las.forEach((la: any) => {
          idArray.push(la.la_code);
        });

        setLasForRegion(las);
        setLaIdsForRegion(idArray);

        const map: any = {};
        map[locationIds[3]] = locationNamesWithAverageLabels.CountryLabel;
        map[locationIds[2]] = locationNamesWithAverageLabels.RegionLabel;
        las.map((item: any) => (map[item.la_code] = item.la_name));
        setBedNumberRowHeaders(map);
      }
    };
    fetchLasForRegion();
  }, [locationIds, locationNamesWithAverageLabels]);

  useEffect(() => {
    // Set up the basic metric queries
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
  }, [CPLocationId, locationIds]);

  useEffect(() => {
    // Set up filterable metric queries for the types table
    const storedData = localStorage.getItem('type-table-metrics');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          const ids = parsedData.map((item) => item.metric_id);
          setCareHomeBedTypesDataQuery(() => ({
            metric_ids: ['bedcount_per_hundred_thousand_adults_total', ...ids],
            location_ids: locationIds,
            most_recent: true,
          }));
          const map: any = {};
          parsedData.map((item) => (map[item.metric_id] = item.filter_bedtype));
          setBedTypeRowHeaders(map);
          const tMetricNames = parsedData.map((obj) => obj['filter_bedtype']);
          setSelectedBedTypeTableFilters(tMetricNames);
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

  useEffect(() => {
    // Set up filterable metric queries for the numbers table
    const storedData = localStorage.getItem('numbers-table-metrics');
    if (storedData && locationIds && laIdsForRegion && lasForRegion) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData) {
          const id = parsedData.metric_id;
          const name = parsedData.filter_bedtype;
          setCareHomeBedNumbersDataQuery({
            metric_ids: [id],
            location_ids: [locationIds[3], locationIds[2], ...laIdsForRegion],
            most_recent: true,
          });
          AnalyticsService.trackMetricView(id);
          if (name) {
            setSelectedBedNumberTableFilter(name);
          } else {
            setSelectedBedNumberTableFilter(bedNumberMetricIds);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else if (locationIds && laIdsForRegion) {
      setCareHomeBedNumbersDataQuery({
        metric_ids: bedNumberMetricIds,
        location_ids: [locationIds[3], locationIds[2], ...laIdsForRegion],
      });
    }
  }, [locationIds, laIdsForRegion, lasForRegion]);

  // Generate time series chart data
  const [timeData, setTimedata] = useState<Series[]>([]);
  useEffect(() => {
    if (!allBedTypeData.length) return;
    let series: Series[] = [];
    const la_code = locationIds[1];
    // Make some time series data based on the bed type row headers
    Object.entries(bedTypeRowHeaders).forEach((header: any) => {
      const metric_id = header[0];
      const name = header[1];
      // Filter to the current metric ID, for the LA only
      const metric_items = allBedTypeData.filter(
        (item) => item.metric_id === metric_id && item.location_id === la_code
      );
      // Turn into the correct time series format
      const values: DataPoint[] = metric_items.map((item) => {
        return {
          date: IndicatorService.parseDate(item).toISOString(),
          value: item.data_point,
        };
      });
      // Sort by date
      values.sort((a, b) => {
        if (a.date > b.date) {
          return 1;
        } else {
          return -1;
        }
      });
      series.push({
        name: name,
        data: values,
      });
    });
    setTimedata(series);
  }, [allBedTypeData]);

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
      <DataBox
        dataTitle="Care home bed numbers"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href="/help/beds-per-100000-adult-population"
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population
              is calculated.
            </a>
          </>
        }
      >
        <div className="govuk-form-group govuk-!-padding-top-3">
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Filter</dt>
              <dd className="govuk-summary-list__value">
                {selectedBedNumberTableFilter}
              </dd>
              <dd className="govuk-summary-list__actions">
                <a
                  href="/topics/residential-care/provision-and-occupancy/number-filters"
                  className="govuk-link"
                >
                  Change<span className="govuk-visually-hidden"> filters</span>
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <DataTabs
          id="1"
          chart={
            <>
              <h3 className="govuk-heading-s">
                Figure 1: chart of care home beds per 100,000 adult population -
                local authorities in {locationNamesCP.RegionLabel},{' '}
                {IndicatorService.getMostRecentDate(filteredBedNumbersData)}
              </h3>
              {(chartData.categories.length > 0 &&
                chartData.values.length > 0 && (
                  <div style={{ height: '800px' }}>
                    <BarChart
                      categories={chartData.categories}
                      values={chartData.values}
                      highlightCategory={locationNamesCP.LALabel}
                      darkBlueCount={2}
                    />
                  </div>
                )) || <p>Loading chart...</p>}
              <p className="govuk-body">
                Source: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)
              </p>
            </>
          }
          table={
            <VerticalLocationTable
              tableref={tableref1}
              caption={
                `Table 1: care home bed numbers per 100,000 adult population for regional local authorities -
                ${locationNamesCP.RegionLabel}, ` +
                IndicatorService.getMostRecentDate(filteredBedNumbersData)
              }
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={[
                'Area',
                'Care home beds per 100,000 adult population',
              ]}
              rowHeaders={bedNumberRowHeaders}
              data={filteredBedNumbersData}
              userLa={locationNamesCP.LALabel}
            ></VerticalLocationTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="care_home_bed_numbers.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>
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
        <div className="govuk-form-group govuk-!-padding-top-3">
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Filters</dt>
              <dd className="govuk-summary-list__value">
                <ul className="govuk-!-margin-top-0 govuk-!-padding-left-0 nobullet">
                  {selectedBedTypeTableFilters.map((filter, index) => (
                    <li key={index}>{filter}</li>
                  ))}
                </ul>
              </dd>
              <dd className="govuk-summary-list__actions">
                <a
                  href="/topics/residential-care/provision-and-occupancy/type-filters"
                  className="govuk-link"
                >
                  Change<span className="govuk-visually-hidden"> filters</span>
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <DataTabs
          id="2"
          table={
            <DataTable
              tableref={tableref2}
              caption={
                `Table 2: care home bed numbers per 100,000 adult population – ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, ` +
                IndicatorService.getMostRecentDate(filteredBedTypeData)
              }
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesWithAverageLabels}
              rowHeaders={bedTypeRowHeaders}
              data={filteredBedTypeData}
              showCareProvider={false}
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
                  {filteredBedTypeData.find(
                    (metric) =>
                      metric.metric_id ===
                        'bedcount_per_hundred_thousand_adults_total' &&
                      metric.location_type === 'LA'
                  )?.data_point ?? 'Loading...'}{' '}
                  beds per 100,000 adult population
                </strong>
                , compared to the {locationNamesCP.RegionLabel} regional average
                of{' '}
                {filteredBedTypeData.find(
                  (metric) =>
                    metric.metric_id ===
                      'bedcount_per_hundred_thousand_adults_total' &&
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
              caption={
                `Table 3: care home bed numbers and occupancy levels – 
                ${locationNamesCP.CPLabel}, ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, ` +
                IndicatorService.getMostRecentDate(finalCpData)
              }
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
                data={finalCpData}
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

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l govuk-!-margin-top-9">Trends</h2>
        </div>
      </div>

      <DataBox
        dataTitle="Care home bed numbers - trends over time"
        dataInfo={
          <p className="govuk-body">
            Find out{' '}
            <a
              href="/help/beds-per-100000-adult-population-over-time"
              className="govuk-link"
            >
              how the total number of adult social care beds per 100,000 adults
              in the local authority area over time is calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="4"
          graph={
            <>
              <h3 className="govuk-heading-s">
                Figure 2: graph of care home bed numbers per 100,000 adult
                population &mdash; {locationNamesCP.LALabel} local authority
              </h3>
              {(timeData.length > 0 && (
                <div style={{ width: '100%', height: `500px` }}>
                  <TimeSeriesChart series={timeData} />
                </div>
              )) || <p>Loading graph</p>}
              <p className="govuk-body">
                Source: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)
              </p>
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

      <RelatedDataList>
        <DataLinkCard
          label="Unpaid care"
          description="Statistics on the people who provide unpaid care to family members, friends and neighbours."
          url="/topics/residential-care/unpaid-care/data"
        />
      </RelatedDataList>

      <LocalMarketInformation
        localAuthority={locationNamesCP.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
