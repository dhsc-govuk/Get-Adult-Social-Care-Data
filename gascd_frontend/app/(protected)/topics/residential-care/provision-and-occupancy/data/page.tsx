'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User, useSession } from '@/lib/auth-client';
import Layout from '@/components/common/layout/Layout';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import DataTable from '@/components/tables/table';
import VerticalLocationTable from '@/components/tables/VerticalLocationTable';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import BarChart from '@/components/charts/BarChart';
import TimeSeriesChart, {
  DataPoint,
  Series,
} from '@/components/charts/TimeSeriesChart';
import FilterRadioGroup from '@/components/filters/FilterRadioGroup';
import FilterCheckboxGroup from '@/components/filters/FilterCheckboxGroup';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { Filters } from '@/data/interfaces/Filters';
import TableService from '@/services/Table/TableService';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { ALLOWED_CP_USER_TYPES } from '@/constants';

const CARE_HOME_RESIDENTIAL_CATEGORY = 'residential';

const showCPLevelData = (user: User | null | undefined) => {
  return (
    (user &&
      ALLOWED_CP_USER_TYPES.includes(user.locationType || '') &&
      user.selectedLocationCategory === CARE_HOME_RESIDENTIAL_CATEGORY) ||
    false
  );
};

export default function ProvisionAndOccupancyPage() {
  const { data: session } = useSession();
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);

  // location variables
  const [locationNamesCP, setLocationNamesCP] = useState<LocationNames>({
    CPLabel: 'Loading...',
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
  const [lasForRegion, setLasForRegion] = useState<string[]>();
  const [laIdsForRegion, setLaIdsForRegion] = useState<string[]>();

  // full data sets
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [latestBedTypeData, setLatestBedTypeData] = useState<Indicator[]>([]);
  const [bedTypeOverTimeData, setBedTypeOverTimeData] = useState<Indicator[]>(
    []
  );
  const [bedNumbersData, setBedNumbersData] = useState<Indicator[]>([]);

  // Filtered data sets
  const [filteredCareHomeBedNumbersData, setFilteredCareHomeBedNumbersData] =
    useState<Indicator[]>([]);
  const [filteredCareHomeBedTypesData, setFilteredCareHomeBedTypesData] =
    useState<Indicator[]>([]);

  // data queries
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

  const [
    careHomeBedTypesOverTimeDataQuery,
    setCareHomeBedTypesOverTimeDataQuery,
  ] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  // headers for tables and charts
  const bedTypeRowHeadersDefault = {
    bedcount_per_hundred_thousand_adults_total: 'All bed types',
    bedcount_per_hundred_thousand_adults_community_care: 'Community care bed',
    bedcount_per_hundred_thousand_adults_dementia_nursing: 'Dementia nursing',
    bedcount_per_hundred_thousand_adults_dementia_residential:
      'Dementia residential',
    bedcount_per_hundred_thousand_adults_general_nursing: 'General nursing',
    bedcount_per_hundred_thousand_adults_general_residential:
      'General residential',
    bedcount_per_hundred_thousand_adults_learning_disability_nursing:
      'Learning disability nursing',
    bedcount_per_hundred_thousand_adults_learning_disability_residential:
      'Learning disability residential',
    bedcount_per_hundred_thousand_adults_mental_health_nursing:
      'Mental health nursing',
    bedcount_per_hundred_thousand_adults_mental_health_residential:
      'Mental health residential',
    bedcount_per_hundred_thousand_adults_transitional: 'Transitional',
    bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled:
      'Young physically disabled',
  };

  const [bedTypeRowHeaders, setBedTypeRowHeaders] = useState<any>(
    bedTypeRowHeadersDefault
  );

  const bedTypeChartHeadersDefault = {
    bedcount_per_hundred_thousand_adults_total: 'All bed types',
    bedcount_per_hundred_thousand_adults_dementia_nursing: 'Dementia nursing',
    bedcount_per_hundred_thousand_adults_dementia_residential:
      'Dementia residential',
  };

  const [bedNumberRowHeaders, setBedNumberRowHeaders] = useState<Object[]>([]);

  // metric ids
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
    'bedcount_per_hundred_thousand_adults_total',
    'bedcount_per_hundred_thousand_adults_community_care',
    'bedcount_per_hundred_thousand_adults_dementia_nursing',
    'bedcount_per_hundred_thousand_adults_dementia_residential',
    'bedcount_per_hundred_thousand_adults_general_nursing',
    'bedcount_per_hundred_thousand_adults_general_residential',
    'bedcount_per_hundred_thousand_adults_learning_disability_nursing',
    'bedcount_per_hundred_thousand_adults_learning_disability_residential',
    'bedcount_per_hundred_thousand_adults_mental_health_nursing',
    'bedcount_per_hundred_thousand_adults_mental_health_residential',
    'bedcount_per_hundred_thousand_adults_transitional',
    'bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled',
  ];

  const bedTypeFilters: Filters[] = [
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_total',
      filter_label: 'All bed types',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_community_care',
      filter_label: 'Community care',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_dementia_nursing',
      filter_label: 'Dementia nursing',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_dementia_residential',
      filter_label: 'Dementia residential',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_general_nursing',
      filter_label: 'General nursing',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_general_residential',
      filter_label: 'General residential',
      checked: false,
    },
    {
      metric_id:
        'bedcount_per_hundred_thousand_adults_learning_disability_nursing',
      filter_label: 'Learning disability nursing',
      checked: false,
    },
    {
      metric_id:
        'bedcount_per_hundred_thousand_adults_learning_disability_residential',
      filter_label: 'Learning disability residential',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_mental_health_nursing',
      filter_label: 'Mental health nursing',
      checked: false,
    },
    {
      metric_id:
        'bedcount_per_hundred_thousand_adults_mental_health_residential',
      filter_label: 'Mental health residential',
      checked: false,
    },
    {
      metric_id: 'bedcount_per_hundred_thousand_adults_total_transitional',
      filter_label: 'Transitional',
      checked: false,
    },
    {
      metric_id:
        'bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled',
      filter_label: 'Young physically disabled',
      checked: false,
    },
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

  const updateBarChartData = () => {
    if (!filteredCareHomeBedNumbersData.length) {
      return;
    }
    let categories: string[] = [];
    let values: number[] = [];
    Object.entries(bedNumberRowHeaders).map((header: any) => {
      categories.push(header[1]);
      const datapoints = filteredCareHomeBedNumbersData.filter(
        (item) => item.location_id === header[0]
      );
      if (datapoints.length && datapoints[0].data_point !== null) {
        values.push(datapoints[0].data_point);
      } else {
        values.push(0);
      }
    });
    setChartData({
      categories: categories,
      values: values,
    });
  };

  useEffect(() => {
    updateBarChartData();
  }, [bedNumberRowHeaders, filteredCareHomeBedNumbersData]);

  // Location effects
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
    // Get the location names for the current location
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNamesCP(locationNamesCP);
          setLocationNamesWithAverageLabels({
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

  // Data fetching effects
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
      setCareHomeBedTypesOverTimeDataQuery(() => ({
        metric_ids: bedTypeMetricIds,
        location_ids: [locationIds[1]],
        query_type: 'LATimeseriesQuery',
      }));
    }
    if (laIdsForRegion?.length) {
      setCareHomeBedNumbersDataQuery({
        metric_ids: bedTypeMetricIds,
        location_ids: [locationIds[3], locationIds[2], ...laIdsForRegion],
        query_type: 'RegionQuery',
      });
    }
  }, [CPLocationId, locationIds, laIdsForRegion]);

  useEffect(() => {
    // Fetch all metric data based on set queries
    const fetchCareProviderData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
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
    fetchCareProviderData();
  }, [careProviderDataQuery1, careProviderDataQuery2]);

  useEffect(() => {
    const careHomeBedTypesData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedTypesDataQuery.location_ids.length) {
          const bedTypeData: Indicator[] = await IndicatorFetchService.getData(
            careHomeBedTypesDataQuery
          );
          const filteredBedTypeData = TableService.filterDate(bedTypeData);
          setLatestBedTypeData(filteredBedTypeData);
          setFilteredCareHomeBedTypesData(filteredBedTypeData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedTypesData();
  }, [careHomeBedTypesDataQuery]);

  useEffect(() => {
    const careHomeBedTypesOverTimeData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedTypesOverTimeDataQuery.location_ids.length) {
          const bedTypeOverTimeData: Indicator[] =
            await IndicatorFetchService.getData(
              careHomeBedTypesOverTimeDataQuery
            );
          setBedTypeOverTimeData(bedTypeOverTimeData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedTypesOverTimeData();
  }, [careHomeBedTypesOverTimeDataQuery]);

  useEffect(() => {
    const careHomeBedNumbersData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedNumbersDataQuery.location_ids.length) {
          const bedNumberData: Indicator[] =
            await IndicatorFetchService.getData(careHomeBedNumbersDataQuery);
          const bedNumbersData = TableService.filterDate(bedNumberData);
          setBedNumbersData(bedNumbersData);
          setFilteredCareHomeBedNumbersData(
            bedNumbersData.filter(
              (item) =>
                'bedcount_per_hundred_thousand_adults_total' === item.metric_id
            )
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedNumbersData();
  }, [careHomeBedNumbersDataQuery]);

  // update data based on filter changes
  useEffect(() => {
    updateTypesTableMetrics();
  }, [latestBedTypeData]);

  const updateTypesTableMetrics = () => {
    const storedData = localStorage.getItem('type-table-metrics');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          const ids = parsedData.map((item) => item.metric_id);
          setFilteredCareHomeBedTypesData(
            latestBedTypeData.filter((item) => ids.includes(item.metric_id))
          );
          const map: any = {};
          parsedData.map((item) => (map[item.metric_id] = item.filter_label));
          setBedTypeRowHeaders(map);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setFilteredCareHomeBedTypesData(latestBedTypeData);
      setBedTypeRowHeaders(bedTypeRowHeadersDefault);
    }
  };

  useEffect(() => {
    updateNumbersTableMetrics();
  }, [bedNumbersData]);

  const updateNumbersTableMetrics = () => {
    // Set up filterable metric queries for the numbers table
    const storedData = localStorage.getItem('numbers-table-metrics');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData) {
        const id = parsedData.metric_id;
        const name = parsedData.filter_label;
        setFilteredCareHomeBedNumbersData(
          bedNumbersData.filter((item) => id === item.metric_id)
        );
        AnalyticsService.trackMetricView(id);
      }
    } else {
      setFilteredCareHomeBedNumbersData(
        bedNumbersData.filter(
          (item) =>
            'bedcount_per_hundred_thousand_adults_total' === item.metric_id
        )
      );
    }
  };

  useEffect(() => {
    updateTypesChartMetrics();
  }, [bedTypeOverTimeData]);

  const [timeData, setTimedata] = useState<Series[]>([]);
  // Generate time series chart data
  const updateTypesChartMetrics = () => {
    if (!bedTypeOverTimeData.length) return;

    const storedData = localStorage.getItem('type-chart-metrics');
    let headers = bedTypeChartHeadersDefault;
    if (storedData) {
      const filters = JSON.parse(storedData);
      const map: any = {};
      filters.map((item: any) => (map[item.metric_id] = item.filter_label));
      headers = map;
    }
    // Make some time series data based on the bed type row headers
    let series: Series[] = createTimeSeries(headers);
    setTimedata(series);
  };

  const createTimeSeries = (headers: any) => {
    let series: Series[] = [];
    Object.entries(headers).forEach((header: any) => {
      const metric_id = header[0];
      const name = header[1];
      // Filter to the current metric ID, for the LA only
      const metric_items = bedTypeOverTimeData.filter(
        (item) => item.metric_id === metric_id
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
    return series;
  };

  return (
    <Layout
      title="Provision and occupancy"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="provision-and-occupancy"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
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
        <FilterRadioGroup
          filterType="numbers-table-metrics"
          filterLabel="Bed type"
          filters={bedTypeFilters}
          updateMethod={updateNumbersTableMetrics}
        />
        <DataTabs
          id="1"
          chart={
            <>
              <h3 className="govuk-heading-s">
                Figure 1: chart of care home beds per 100,000 adult population -
                local authorities in {locationNamesCP.RegionLabel},{' '}
                {IndicatorService.getMostRecentDate(bedNumbersData)}
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
                IndicatorService.getMostRecentDate(bedNumbersData)
              }
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={[
                'Area',
                'Care home beds per 100,000 adult population',
              ]}
              rowHeaders={bedNumberRowHeaders}
              data={filteredCareHomeBedNumbersData}
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
                downloadType="care home bed numbers per 100,000 adult population for regional local authorities"
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
        <FilterCheckboxGroup
          filterType="type-table-metrics"
          filterLabel="Bed type"
          filters={bedTypeFilters}
          updateMethod={updateTypesTableMetrics}
        />
        <DataTabs
          id="2"
          table={
            <DataTable
              tableref={tableref2}
              caption={
                `Table 2: care home bed numbers per 100,000 adult population – ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, ` +
                IndicatorService.getMostRecentDate(latestBedTypeData)
              }
              metricColumnName="Care home bed type"
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesWithAverageLabels}
              rowHeaders={bedTypeRowHeaders}
              data={filteredCareHomeBedTypesData}
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
                  {latestBedTypeData.find(
                    (metric) =>
                      metric.metric_id ===
                        'bedcount_per_hundred_thousand_adults_total' &&
                      metric.location_type === 'LA'
                  )?.data_point ?? 'Loading...'}{' '}
                  beds per 100,000 adult population
                </strong>
                , compared to the {locationNamesCP.RegionLabel} regional average
                of{' '}
                {latestBedTypeData.find(
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
                downloadType="care home bed numbers per 100,000 adult population"
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
                `Table 3: care home bed numbers and occupancy levels – ` +
                ((session &&
                  showCPLevelData(session.user) &&
                  `${locationNamesCP.CPLabel}, `) ||
                  '') +
                `${locationNamesCP.LALabel} local authority, 
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
              showCareProvider={showCPLevelData(session?.user)}
              careProviderMedianMetrics={careProviderMedianMetrics}
              percentageRows={['median_occupancy_total']}
              showAverageLabel={true}
            ></DataTable>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              {session?.user.selectedLocationCategory ===
                CARE_HOME_RESIDENTIAL_CATEGORY && (
                <>
                  <p className="govuk-body">
                    {locationNamesCP.CPLabel} is a provider with{' '}
                    <strong>
                      {finalCpData.find(
                        (metric) =>
                          metric.metric_id === 'bedcount_total' &&
                          metric.location_type === 'CareProviderLocation'
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
                </>
              )}
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
                downloadType="care home bed numbers and occupancy levels"
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
        <FilterCheckboxGroup
          filterType="type-chart-metrics"
          filterLabel="Bed type"
          filters={bedTypeFilters}
          updateMethod={updateTypesChartMetrics}
        />
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
          label="Care providers: locations and services"
          description="Data on residential care homes and nursing homes by location and service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Number of adults receiving community social care"
          description="Data on the number of people supported through community social care, including trends over time."
          url="/topics/residential-care/number-of-people-receiving-care/data"
        />
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
