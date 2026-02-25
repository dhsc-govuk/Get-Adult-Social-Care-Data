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
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import { ALLOWED_CP_USER_TYPES } from '@/constants';
import { User, useSession } from '@/lib/auth-client';

const CARE_HOME_COMM_CATEGORY = 'community';

const showCPLevelData = (user: User | null | undefined) => {
  return (
    (user &&
      ALLOWED_CP_USER_TYPES.includes(user.locationType || '') &&
      user.selectedLocationCategory === CARE_HOME_COMM_CATEGORY) ||
    false
  );
};

export default function NumberPeopleReceivingCarePage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const { data: session } = useSession();

  const [locationNames, setLocationNames] = useState<LocationNames>({
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
      text: 'Population needs',
      url: '/topics/residential-care/subtopics',
    },
  ];

  const demographicMetricIds = ['nccc_num_clients_comm_care'];

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
            true
          );
          setLocationNames(locationNames);
          setLocationNamesWithAverageLabels({
            CPLabel: locationNames.CPLabel!,
            LALabel: `Total for ${locationNames.LALabel}`,
            RegionLabel: `${locationNames.RegionLabel} (regional average)`,
            CountryLabel: `${locationNames.CountryLabel} (national average)`,
          });
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
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setFilteredDemographicData(filteredDemographicData);
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

  return (
    <Layout
      title="Number of adults receiving community social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="number-of-people-receiving-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Number of adults receiving community social care
          </h1>
          <p className="govuk-body-l">
            Data on the number of people supported through community social
            care, including trends over time.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Number of adults receiving community social care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href="/help/number-people-receiving-care-from-community-social-care-provider"
                className="govuk-link"
              >
                how the number of people receiving community social care is
                calculated
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="1"
          table={
            <DataTable
              tableref={tableref1}
              caption={`Table 1: number of people receiving community social care in the last month – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, ${IndicatorService.getMostRecentMonthYear(filteredDemographicData)}`}
              source={
                'Capacity Tracker from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNamesWithAverageLabels}
              rowHeaders={{
                nccc_num_clients_comm_care: `People receiving community social care in ${IndicatorService.getMostRecentMonthYear(filteredDemographicData)}`,
              }}
              data={filteredDemographicData}
              showCareProvider={showCPLevelData(session?.user)}
              careProviderMedianMetrics={{
                nccc_num_clients_comm_care: 'nccc_num_clients_comm_care',
              }}
              percentageRows={[]}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="number_of_people_receiving_community_social_care.csv"
                xLabel=""
                downloadType="number of people receiving community social care in the last month"
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Number of people receiving care from a community social care provider"
          sources="Capacity Tracker"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/number-people-receiving-care-from-community-social-care-provider"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care providers: locations and services"
          description="Data on residential care homes and nursing homes by location and service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Unpaid care"
          description="Statistics on the people who provide unpaid care to family members, friends and neighbours."
          url="/topics/residential-care/unpaid-care/data"
        />
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
        />
      </RelatedDataList>

      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
