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

export default function UnpaidCarePage() {
  const tableref1 = useRef<HTMLTableElement>(null);

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
      text: 'Care provision',
      url: '/topics/residential-care/subtopics',
    },
  ];

  const demographicMetricIds = ['perc_unpaid_care_provider'];

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
      title="Unpaid care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="unpaid-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Unpaid care</h1>
          <p className="govuk-body-l">
            Statistics on the people who provide unpaid care to family members,
            friends and neighbours.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="People aged 5 and over who provide unpaid care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href="/help/percentage-people-aged-5-and-over-who-provide-unpaid-care"
                className="govuk-link"
              >
                how unpaid care is measured.
              </a>{' '}
            </p>
          </>
        }
      >
        <DataTabs
          id="1"
          table={
            <DataTable
              tableref={tableref1}
              caption={
                <>
                  Table 1: percentage of people aged 5 and over who provide
                  unpaid care – {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getMostRecentDate(filteredDemographicData)}
                </>
              }
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_unpaid_care_provider:
                  'Percentage of people aged 5 or over who provide unpaid care',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['perc_unpaid_care_provider']}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="percent_unpaid_care.csv"
                xLabel=""
                downloadType="percentage of people aged 5 and over who provide unpaid care"
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="People aged 5 and over who provide unpaid care"
          sources="Office for National Statistics."
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/percentage-people-aged-5-and-over-who-provide-unpaid-care"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
        />
        <DataLinkCard
          label="Care provider services"
          description="Data on residential care homes and nursing homes by service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Number of adults receiving community social care"
          description="Data on the number of people supported through community social care, including trends over time."
          url="/topics/residential-care/number-of-people-receiving-care/data"
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
