'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useState } from 'react';
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

export default function ProvisionAndOccupancyPage() {
  const [locationNames, setLocationNames] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);

  const { data: session } = authClient.useSession();

  const demographicMetricIds = [
    'total_population',
    'perc_18_64',
    'perc_65over',
    'perc_75over',
    'perc_85over',
  ];

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/population-needs/subtopics',
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
  }, [demographicQuery, CPLocationId]);

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
      title="Population size and age group percentages"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="population-size-and-age-group"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Population size and age group percentages
          </h1>
          <p className="govuk-body-l">
            Population data at district, local authority, regional and national
            levels for England.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Adult population size with age group percentages"
        dataInfo={
          <>
            Find out how{' '}
            <a href="/help/population-size" className="govuk-link">
              population size
            </a>{' '}
            and{' '}
            <a href="/help/population-age" className="govuk-link">
              age group percentages
            </a>{' '}
            are calculated.
          </>
        }
      >
        <DataTabs
          id="3"
          table={
            <DataTable
              caption={`Table 1: population size and age group percentages – 
                ${locationNames.LALabel} local authority, 
                ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, mid-2024`}
              source={
                'Population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                total_population: 'Total adult population',
                perc_18_64: 'Aged 18 to 64',
                perc_65over: 'Aged 65 and over',
                perc_75over: 'Aged 75 and over',
                perc_85over: 'Aged 85 and over',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[
                'perc_18_64',
                'perc_65over',
                'perc_75over',
                'perc_85over',
              ]}
              showAverageLabel={false}
            ></DataTable>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <ConditionalText
                data={filteredDemographicData}
                ColumnHeaders={locationNames}
                section="Drivers"
                metric_Id="perc_65over"
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
          label="Age group percentages"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-age"
        />
        <DataLinkCard
          label="Population size"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-size"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNames.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
