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
import RelatedDataList from '@/components/data-components/RelatedDataList';
import SubCatergoryTable from '@/components/tables/SubCatergoryTable';
import IndicatorService from '@/services/indicator/IndicatorService';
import PointMap from '@/components/maps/PointMap';
import { LocationDisplayData } from '@/data/interfaces/LocationDisplayData';

export default function ResidentialCareProvidersPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);

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
      text: 'Care provision',
      url: '/topics/residential-care/subtopics',
    },
  ];

  const demographicMetricIds = [
    'npl_adult_social_care',
    'npl_care_home',
    'npl_care_home_nursing',
    'npl_care_home_residential',
    'npl_community_care',
    'npl_domiciliary_care',
    'npl_extra_care_housing',
    'npl_other_community_care',
    'npl_supported_living',
  ];

  const demoLocations: LocationDisplayData[] = [
    {
      coordinates: [51.5072, 0.1276],
      provider_location_id: 'id',
      name: 'place 1',
      address: 'address 1',
      services: 'services 1',
      cqc_rating: 'good',
      distance_from_postcode: 1.0093,
    },
    {
      coordinates: [52.5072, 0.6276],
      provider_location_id: 'id',
      name: 'place 2',
      address: 'address 2',
      services: 'services 2',
      cqc_rating: 'good',
      distance_from_postcode: 0.953,
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
          setLocationNamesWithAverageLabels({
            CPLabel: locationNames.CPLabel!,
            LALabel: locationNames.LALabel,
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
      title="Care provider services"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="care-providers"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Care provider services</h1>
          <p className="govuk-body-l">
            Data on care provision by service type and number of providers.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Care provider locations near postcode EX16 1GF for Ashfield Court (Exeter)"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Locations and service information for CQC-registered residential
              social care and community based adult social care service
              providers in England, August 2025.
            </p>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href="/help/total-number-community-social-care-providers"
                className="govuk-link"
              >
                how the number of adult social care providers is calculated
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          map={
            <PointMap
              centrePoint={[51.505, -0.09]}
              popupText="Postcode"
              nearbyLocations={demoLocations}
            />
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Number of adult social care providers"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href="/help/total-number-community-social-care-providers"
                className="govuk-link"
              >
                how the number of adult social care providers is calculated
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <SubCatergoryTable
              tableref={tableref2}
              caption={
                <>
                  Table 1: number of adult social care providers –{' '}
                  {locationNames.LALabel}{' '}
                  <abbr title="Local Authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getMostRecentMonthYear(
                    filteredDemographicData
                  )}
                </>
              }
              source={'Care Directory from the Care Quality Commission (CQC)'}
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName="Service provider type"
              rowHeaders={{
                npl_adult_social_care: 'Total adult social care providers',
                npl_care_home: 'Care home providers',
                npl_care_home_nursing: 'Nursing',
                npl_care_home_residential: 'Residental',
                npl_community_care: 'Community social care providers',
                npl_domiciliary_care: 'Home care providers',
                npl_supported_living: 'Supported living providers',
                npl_extra_care_housing: 'Extra care housing providers',
                npl_other_community_care: 'Other community based care provider',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              totalsRows={[
                'npl_adult_social_care',
                'npl_care_home',
                'npl_community_care',
              ]}
            ></SubCatergoryTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="number_of_adult_social_care_providers.csv"
                xLabel=""
                downloadType="number of adult social care providers"
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Number of adult social care providers"
          sources="Care Quality Commission"
          updateFrequency="Monthly updates"
          limitations={true}
          url="/help/total-number-community-social-care-providers"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
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
        localAuthority={locationNames.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
