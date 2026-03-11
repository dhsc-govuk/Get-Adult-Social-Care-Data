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
import TableService from '@/services/Table/TableService';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import AnalyticsService from '@/services/analytics/analyticsService';
import TimeSeriesTable from '@/components/tables/TimeSeriesTable';

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

  // These are made up and need to be replaced by the read IDs when we have them
  const demographicMetricIds = [
    'pansi_pred_pop_early_dem_aged_30_64',
    'pansi_pred_pop_challenging_behaviour_aged_18_64',
    'pansi_pred_pop_asd_aged_18_64',

    'pansi_pred_pop_early_dem_aged_30_64_perc_change',
    'pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change',
    'pansi_pred_pop_asd_aged_18_64_perc_change',
  ];

  // Replace with dynamic dates when we have them, this is just to show the table structure for now
  const columnDates = ['2025', '2030', '2035', '2040', '2045'];

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
        location_ids: [locationIds[1]],
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

  return (
    <Layout
      title="Local Authority funding projected demand"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="la-funding-planning"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Local Authority funding projected demand
          </h1>
          <p className="govuk-body-l">
            Consolidated estimated data on population with selected conditions
            within a Local Authority area.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Comparison of estimated population with selected health conditions over time"
        dataInfo={
          <>
            <p className="govuk-body-m">Add later</p>
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
                  health conditions over time within Local Authority area
                </>
              }
              source={'PANSI'}
              columnHeaders={columnDates}
              rowHeaders={{
                pansi_pred_pop_early_dem_aged_30_64:
                  'Total population aged 30-64 to have early onset dementia',
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
        dataTitle="Estimated percentage change in population with selected health conditions - trends over time"
        dataInfo={
          <>
            <p className="govuk-body-m">Add later</p>
          </>
        }
      >
        <DataTabs
          id="2"
          chart={<p>Add later</p>}
          table={
            <TimeSeriesTable
              tableref={tableref2}
              caption={
                <>
                  Table 2: estimated percentage change in population with
                  selected health conditions compared with similar Local
                  Authorities
                </>
              }
              source={'PANSI'}
              columnHeaders={columnDates}
              rowHeaders={{
                pansi_pred_pop_early_dem_aged_30_64_perc_change:
                  'Total population aged 30-64 to have early onset dementia',
                pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change:
                  'Total population aged 18-64 with a learning disability, predicted to display challenging behaviour',
                pansi_pred_pop_asd_aged_18_64_perc_change:
                  'Total population aged 18-64 predicted to have autistic spectrum disorders',
              }}
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
          label="Total population aged 30-64 to have early onset dementia"
          sources="Office for National Statistics"
          updateFrequency="TBC"
          limitations={true}
          url="/help/estimated-population-early-onset-dementia"
        />
        <DataLinkCard
          label="Total population aged 18-64 with a learning disability, predicted to display challenging behaviour"
          sources="Office for National Statistics"
          updateFrequency="TBC"
          limitations={false}
          url="/help/estimated-population-learning-disability"
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
