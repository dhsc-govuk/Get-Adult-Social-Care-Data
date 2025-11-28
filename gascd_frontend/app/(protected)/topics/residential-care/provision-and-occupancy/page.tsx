'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { MetaData } from '@/data/interfaces/MetaData';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import { LocationNames } from '@/data/interfaces/LocationNames';

export default function ProvisionAndOccupancyPage() {
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
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);
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
      'Care home beds per 100,000 adult population	',
    median_occupancy_total: 'Occupancy level',
  };
  const careProviderRowHeaders = {
    median_bed_count_total: 'Beds per care home	',
    median_occupancy_total: 'Occupancy level',
  };

  const { data: session } = useSession();

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care homes',
      url: '', //todo: update when care homes landing page is created
    },
  ];

  useEffect(() => {
    const fetchCareProviderLocationName = async () => {
      const userLocationId = session?.user.locationId;
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      let foundLocationId;
      const storedLocationId = localStorage.getItem('selectedValue');
      if (storedLocationId) {
        // Check the stored value is actually valid
        if (
          await LocationService.checkCPLocation(
            storedLocationId,
            userLocationId
          )
        ) {
          foundLocationId = storedLocationId;
        } else {
          // Clear the local value if not valid
          console.warn('Invalid stored CP value found. Removing.');
          localStorage.removeItem('selectedValue');
        }
      } else {
        // get it from the user
        if (session.user.locationType == 'Care provider') {
          foundLocationId = await LocationService.getDefaultCPLocation(
            userLocationId,
            session.user.locationType
          );
        } else {
          foundLocationId = userLocationId;
        }
      }
      if (foundLocationId) {
        localStorage.setItem('selectedValue', foundLocationId);
        setCPLocationId(foundLocationId);
      }
    };
    fetchCareProviderLocationName();
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
  }, [bedsQuery, careProviderDataQuery1, careProviderDataQuery2]);

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

  const cleanupLocationIDs = (location_ids_to_clean: string[]) => {
    // XXX Ideally the functions using this would use a different list of location IDs which didn't have
    // the 'Filter' word crowbarred into it from the Present Demand service.
    return location_ids_to_clean.filter((item) => item !== 'Indicator');
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
          <>
            Find out how{' '}
            <a href="/help/percentage-beds-occupied" className="govuk-link">
              occupancy level percentages
            </a>{' '}
            and{' '}
            <a href="/help/beds-care-provider-location" className="govuk-link">
              number of adult social care beds in a care provider location
            </a>{' '}
            are calculated.
          </>
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
              caption={`Table 3: care home bed numbers and occupancy levels – 
                ${locationNamesCP.CPLabel}, ${locationNamesCP.LALabel} local authority, 
                ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, October
                2025`}
              source={
                'Source: Capacity Tracker from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={careProviderRowHeaders}
              data={finalCpData}
              showCareProvider={true}
              careProviderMedianMetrics={careProviderMedianMetrics}
              percentageRows={metricDateType}
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
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily"
          limitations={true}
          url="/help/beds-per-100000-adult-population"
        />
        <DataLinkCard
          label="Number of adult social care beds in a care provider location"
          sources="Capacity Tracker"
          updateFrequency="Daily"
          limitations={true}
          url="/help/beds-care-provider-location"
        />
        <DataLinkCard
          label="Occupancy level percentages for adult social care beds"
          sources="Capacity Tracker"
          updateFrequency="Daily"
          limitations={true}
          url="/help/percentage-beds-occupied"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNamesCP.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
