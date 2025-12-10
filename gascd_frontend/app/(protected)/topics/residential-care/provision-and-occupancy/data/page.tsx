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
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [filteredBedData, setFilteredBedData] = useState<Indicator[]>([]);
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

  const bedRowHeaders = {
    bedcount_per_100000_adults_total:
      'Care home beds per 100,000 adult population',
    median_occupancy_total: 'Occupancy level',
  };

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
        const comboData: Indicator[] = [...CPData, ...CPData2];
        const filteredCPData = TableService.filterDate(comboData);
        setFinalCpData(filteredCPData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [bedsQuery, careProviderDataQuery1, careProviderDataQuery2, CPLocationId]);

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
