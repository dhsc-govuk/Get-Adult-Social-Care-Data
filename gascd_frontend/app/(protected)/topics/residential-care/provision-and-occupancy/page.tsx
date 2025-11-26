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

export default function ProvisionAndOccupancyPage() {
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [locationNamesCP, setLocationNamesCP] = useState<string[]>([]);
  const [bedsQuery, setBedsQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [filteredBedData, setFilteredBedData] = useState<Indicator[]>([]);
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);

  const bedsMetricIds = [
    'bedcount_per_100000_adults_total',
    'median_occupancy_total',
  ];

  const bedRowHeaders = {
    bedcount_per_100000_adults_total:
      'Care home beds per 100,000 adult population	',
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
          const locationNames = await LocationService.getLocationNames(
            CPLocationId,
            false
          );
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNames(locationNames);
          setLocationNamesCP(locationNamesCP);
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [bedsQuery]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await LocationService.getLocationIds(
            CPLocationId,
            false
          );
          const locationIdsCP = await LocationService.getLocationIds(
            CPLocationId,
            true
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
        dataTitle="Care home bed numbers"
        dataInfo={
          <>
            Find out{' '}
            <a
              href="/help/beds-per-100000-adult-population"
              className="govuk-link"
            >
              how the number of adult social care beds per 100,000 adult
              population is calculated
            </a>
          </>
        }
      >
        <DataTabs
          id="1"
          chart={
            <>
              <h4 className="govuk-heading-s">
                Figure 1: chart of care home beds per 100,000 adult population –
                local authorities in the {locationNamesCP[3]}, October 2025
              </h4>
              <p className="govuk-body-m">
                Sources: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)
              </p>
            </>
          }
          table={
            <>
              <h4 className="govuk-heading-s">
                Table 1: care home beds per 100,000 adult population for
                regional local authorities – {locationNamesCP[3]}, October 2025
              </h4>
              <p className="govuk-body-m">
                Sources: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)
              </p>
            </>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Occupancy levels"
        dataInfo={
          <>
            Find out how{' '}
            <a href="/help/percentage-beds-occupied" className="govuk-link">
              occupancy level percentages
            </a>{' '}
            and{' '}
            <a href="/help/beds-care-provider-location" className="govuk-link">
              the number of adult social care beds per 100,000 adult population
            </a>{' '}
            are calculated.
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <>
              <DataTable
                caption={`Table 2: care home bed numbers per 100,000 adult population and
                occupancy levels – ${locationNamesCP[2]} local authority, 
                ${locationNamesCP[3]} region and ${locationNamesCP[4]}, October
                2025`}
                source={`Sources: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)`}
                columnHeaders={locationNames}
                rowHeaders={bedRowHeaders}
                data={filteredBedData}
                showCareProvider={false}
                percentageRows={metricDateType}
              ></DataTable>
            </>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox>
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
        <DataTabs
          id="3"
          table={
            <>
              <h4 className="govuk-heading-s">
                Table 3: care home bed numbers and occupancy levels –{' '}
                {locationNamesCP[1]}, {locationNamesCP[2]} local authority,{' '}
                {locationNamesCP[3]} region and {locationNamesCP[4]}, October
                2025
              </h4>
              <p className="govuk-body-m">
                Sources: Capacity Tracker from the Department of Health and
                Social Care (DHSC)
              </p>
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
      <LocalMarketInformation localAuthority={locationNamesCP[2]} url="" />
      <BackToTop />
    </Layout>
  );
}
