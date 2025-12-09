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
import { MetaData } from '@/data/interfaces/MetaData';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';

export default function DisabilityPrevalence() {
  const [locationNames, setLocationNames] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  const { data: session } = authClient.useSession();

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/topics/population-needs/subtopics',
    },
  ];

  const demographicMetricIds = [
    'perc_population_disability_disabled_total',
    'learning_disabilty_prevalence',
    'perc_general_health_total',
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
      title="General health, disability and learning disability"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="disability-prevalence"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            General health, disability and learning disability
          </h1>
          <p className="govuk-body-l">
            Data on disability prevalence, learning disability diagnoses and
            reasons for accessing care.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Disability prevalence"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href="/help/people-who-reported-bad-or-very-bad-health"
                className="govuk-link"
              >
                people who reported bad or very bad health
              </a>{' '}
              and{' '}
              <a href="/help/disability-prevalence" className="govuk-link">
                disability prevalence
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <DataTabs
          id="1"
          table={
            <DataTable
              caption={`Table 1: self-reporting on general health and disability – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_general_health_total:
                  'People who reported bad or very bad health',
                perc_population_disability_disabled_total:
                  'Disability prevalence – people who reported a long-term physical or mental health condition, or illness that limits day-to-day activities',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[
                'perc_general_health_total',
                'perc_population_disability_disabled_total',
              ]}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Disability prevalence"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href="/help/people-who-reported-bad-or-very-bad-health"
                className="govuk-link"
              >
                people who reported bad or very bad health
              </a>{' '}
              and{' '}
              <a href="/help/disability-prevalence" className="govuk-link">
                disability prevalence
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <DataTable
              caption={`Table 2: learning disability prevalence – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Fingertips public health profiles from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                learning_disabilty_prevalence: 'Learning disability prevalence',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['learning_disabilty_prevalence']}
            ></DataTable>
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
          label="Disability prevalence"
          sources="Office for National Statistics."
          updateFrequency="Updated every 10 years"
          limitations={true}
          url="/help/disability-prevalence"
        />
        <DataLinkCard
          label="Learning disability prevalence"
          sources="Department of Health and Social Care."
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/learning-disability-prevalence"
        />
        <DataLinkCard
          label="People who reported bad or very bad health"
          sources="Office for National Statistics."
          updateFrequency="Updated every 10 years"
          limitations={true}
          url="/help/people-who-reported-bad-or-very-bad-health"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNames.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
