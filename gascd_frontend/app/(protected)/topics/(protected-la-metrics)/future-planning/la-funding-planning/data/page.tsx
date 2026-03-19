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
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import AnalyticsService from '@/services/analytics/analyticsService';
import TimeSeriesTable from '@/components/tables/TimeSeriesTable';
import TimeSeriesChart, {
  DataPoint,
  Series,
} from '@/components/charts/TimeSeriesChart';
import IndicatorService from '@/services/indicator/IndicatorService';

export default function LAFundingPlanningPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
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

  const [columnDates, setColumnDates] = useState<string[]>(['Loading...']);

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Future planning',
      url: '/topics/future-planning/subtopics',
    },
  ];

  const demographicMetricIds = [
    'pansi_pred_pop_asd_aged_18_64',
    'pansi_pred_pop_challenging_behaviour_aged_18_64',
    'pansi_pred_pop_early_dem_aged_30_64',

    'pansi_pred_pop_asd_aged_18_64_perc_change',
    'pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change',
    'pansi_pred_pop_early_dem_aged_30_64_perc_change',

    'pansi_pred_pop_asd_aged_18_64_yearly',
    'pansi_pred_pop_challenging_behaviour_aged_18_64_yearly',
    'pansi_pred_pop_early_dem_aged_30_64_yearly',

    'pansi_pred_pop_asd_aged_18_64_perc_change_yearly',
    'pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change_yearly',
    'pansi_pred_pop_early_dem_aged_30_64_perc_change_yearly',
  ];

  const percChangeHeaders = {
    pansi_pred_pop_early_dem_aged_30_64_perc_change:
      'Total population aged 30-64 predicted to have early onset dementia',
    pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change:
      'Total population aged 18-64 with a learning disability, predicted to display challenging behaviour',
    pansi_pred_pop_asd_aged_18_64_perc_change:
      'Total population aged 18-64 predicted to have autistic spectrum disorders',
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
        location_ids: [],
        query_type: 'LATimeseriesQuery',
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);

        demographicData.map((item) => {
          item.metric_id = item.metric_id.replace('_yearly', '');
        });
        const uniqueDates = Array.from(
          new Set(demographicData.map((item) => item.metric_date))
        ).sort();

        setColumnDates(uniqueDates);
        setFilteredDemographicData(demographicData);
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

  const [timeSeriesDataForGraph, setTimeSeriesDataForGraph] = useState<
    Series[]
  >([]);

  useEffect(() => {
    const series = createTimeSeries(percChangeHeaders, filteredDemographicData);
    setTimeSeriesDataForGraph(series);
  }, [filteredDemographicData]);

  const createTimeSeries = (headers: any, data: Indicator[]) => {
    let series: Series[] = [];
    Object.entries(headers).forEach((header: any) => {
      const metric_id = header[0];
      const name = header[1];
      // Filter to the current metric ID
      const metric_items = data.filter((item) => item.metric_id === metric_id);
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
      title="Population projections within local authorities"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="la-funding-planning"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Population projections within local authorities
          </h1>
          <p className="govuk-body-l">
            Data estimates on the prevalence of conditions that may require a
            social care response.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Comparison of estimated population with selected needs over time"
        dataInfo={
          <>
            <p className="govuk-body">
              Find out how{' '}
              <a
                href="/help/estimated-population-early-onset-dementia"
                className="govuk-link"
              >
                people aged 30-64 predicted to have early onset dementia
              </a>
              ,{' '}
              <a
                href="/help/estimated-population-learning-disability"
                className="govuk-link"
              >
                people aged 18-64 with a learning disability, predicted to
                display challenging behaviour
              </a>{' '}
              and{' '}
              <a href="/help/estimated-population-asd" className="govuk-link">
                people aged 18-64 predicted to have autistic spectrum disorders
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <DataTabs
          id="1"
          table={
            <TimeSeriesTable
              tableref={tableref1}
              caption={
                <>
                  Table 1: comparison of estimated population with selected
                  needs over time within {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr> area
                </>
              }
              source={
                'Projected Adult Needs and Service Information (PANSI) v15 August 2025 from the Institute of Public Care'
              }
              columnHeaders={columnDates}
              rowHeaders={{
                pansi_pred_pop_early_dem_aged_30_64:
                  'Total population aged 30-64 predicted to have early onset dementia',
                pansi_pred_pop_challenging_behaviour_aged_18_64:
                  'Total population aged 18-64 with a learning disability, predicted to display challenging behaviour',
                pansi_pred_pop_asd_aged_18_64:
                  'Total population aged 18-64 predicted to have autistic spectrum disorders',
              }}
              data={filteredDemographicData}
              percentageRows={[]}
              currency={false}
            ></TimeSeriesTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="estimated_population_with_selected_health_conditions.csv"
                xLabel=""
                downloadType="Comparison of estimated population with selected health conditions over time"
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
        dataTitle="Estimated change in population with selected needs - trends over time"
        dataInfo={
          <>
            <p className="govuk-body">
              Find out how{' '}
              <a
                href="/help/estimated-population-early-onset-dementia"
                className="govuk-link"
              >
                people aged 30-64 predicted to have early onset dementia
              </a>
              ,{' '}
              <a
                href="/help/estimated-population-learning-disability"
                className="govuk-link"
              >
                people aged 18-64 with a learning disability, predicted to
                display challenging behaviour
              </a>{' '}
              and{' '}
              <a href="/help/estimated-population-asd" className="govuk-link">
                people aged 18-64 predicted to have autistic spectrum disorders
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 1: estimated percentage change in population with
                selected needs over time within {locationNames.LALabel}{' '}
                <abbr title="local authority">LA</abbr> area
              </h4>
              {(timeSeriesDataForGraph.length > 0 && (
                <div style={{ width: '100%', height: `500px` }}>
                  <TimeSeriesChart
                    series={timeSeriesDataForGraph}
                    dateFormat="%Y"
                    ySuffix="%"
                    decimalPoints={2}
                  />
                </div>
              )) || <p>Loading graph</p>}
              <p className="govuk-body">
                Source: Projected Adult Needs and Service Information (PANSI)
                v15 August 2025 from the Institute of Public Care
              </p>
            </>
          }
          table={
            <TimeSeriesTable
              tableref={tableref2}
              caption={
                <>
                  Table 2: estimated percentage change in population with
                  selected needs over time within {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr> area
                </>
              }
              source={
                'Projected Adult Needs and Service Information (PANSI) v15 August 2025 from the Institute of Public Care'
              }
              columnHeaders={columnDates}
              rowHeaders={percChangeHeaders}
              data={filteredDemographicData}
              percentageRows={[
                'pansi_pred_pop_early_dem_aged_30_64_perc_change',
                'pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change',
                'pansi_pred_pop_asd_aged_18_64_perc_change',
              ]}
              currency={false}
            ></TimeSeriesTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="estimated_percentage_change_in_population_with_selected_health_conditions.csv"
                xLabel=""
                downloadType="Estimated percentage change in population with selected health conditions - trends over time"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label="People aged 18-64 predicted to have autistic spectrum disorders, projected to 2045"
          sources="Institute of Public Care"
          updateFrequency="Updated every 5 years"
          limitations={true}
          url="/help/estimated-population-asd"
        />
        <DataLinkCard
          label="People aged 18-64 with a learning disability, predicted to display challenging behaviour, projected to 2045"
          sources="Institute of Public Care"
          updateFrequency="Updated every 5 years"
          limitations={true}
          url="/help/estimated-population-learning-disability"
        />
        <DataLinkCard
          label="People aged 30-64 predicted to have early onset dementia, projected to 2045"
          sources="Institute of Public Care"
          updateFrequency="Updated every 5 years"
          limitations={true}
          url="/help/estimated-population-early-onset-dementia"
        />
      </DataIndicatorDetailsList>

      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
