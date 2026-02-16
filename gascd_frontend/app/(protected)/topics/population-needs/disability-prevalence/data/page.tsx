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

export default function DisabilityPrevalence() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationNamesWithAverageLabels, setLocationNamesWithAverageLabels] =
    useState<LocationNames>({
      IndicatorLabel: 'Primary support reason',
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
      url: '/topics/population-needs/subtopics',
    },
  ];

  const demographicMetricIds = [
    'perc_population_disability',
    'learning_disability_prevalence',
    'perc_general_health',
    'access_and_mobility_only_physical_support_18_and_over',
    'asylum_seeker_support_social_support_18_and_over',
    'learning_disability_support_18_and_over',
    'mental_health_support_18_and_over',
    'personal_care_support_physical_support_18_and_over',
    'substance_misuse_support_social_support_18_and_over',
    'support_for_dual_impairment_sensory_support_18_and_over',
    'support_for_hearing_impairment_sensory_support_18_and_over',
    'support_for_social_isolation_other_social_support_18_and_over',
    'support_for_visual_impairment_sensory_support_18_and_over',
    'support_with_memory_and_cognition_18_and_over',
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
            IndicatorLabel: 'Primary support reason',
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
              tableref={tableref1}
              caption={`Table 1: self-reporting on general health and disability – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_general_health:
                  'People who reported bad or very bad health',
                perc_population_disability:
                  'Disability prevalence – people who reported a long-term physical or mental health condition, or illness that limits day-to-day activities',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[
                'perc_general_health',
                'perc_population_disability',
              ]}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="general_health_and_disability.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Learning disability prevalence"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href="/help/learning-disability-prevalence"
                className="govuk-link"
              >
                learning disability prevalence is calculated
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <DataTable
              tableref={tableref2}
              caption={`Table 2: learning disability prevalence – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, ${IndicatorService.getMostRecentDate(filteredDemographicData)}`}
              source={
                'Fingertips public health profiles from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                learning_disability_prevalence:
                  'Learning disability prevalence',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['learning_disability_prevalence']}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="learning_disability_prevalence.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Primary reason for people to access long-term adult social care"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out how{' '}
              <a
                href="/help/primary-reason-for-accessing-long-term-adult-social-care"
                className="govuk-link"
              >
                primary reason for people to access long-term adult social care
                is calculated.
              </a>
              .
            </p>
          </>
        }
      >
        <DataTabs
          id="3"
          table={
            <DataTable
              tableref={tableref3}
              caption={`Table 3: primary reason for all age groups to access long-term adult social care – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, ${IndicatorService.getMostRecentDate(filteredDemographicData)}`}
              source={
                'Adult Social Care Activity and Finance Report from NHS England'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName="Primary support reason"
              rowHeaders={{
                learning_disability_support_18_and_over:
                  'Learning disability support',
                mental_health_support_18_and_over: 'Mental health support',
                access_and_mobility_only_physical_support_18_and_over:
                  'Physical support: Access and mobility only',
                personal_care_support_physical_support_18_and_over:
                  'Physical support: Personal care support',
                support_for_dual_impairment_sensory_support_18_and_over:
                  'Sensory support: Support for dual impairment',
                support_for_hearing_impairment_sensory_support_18_and_over:
                  'Sensory support: Support for hearing impairment',
                support_for_visual_impairment_sensory_support_18_and_over:
                  'Sensory support: Support for visual impairment',
                asylum_seeker_support_social_support_18_and_over:
                  'Social support: Asylum seeker support',
                substance_misuse_support_social_support_18_and_over:
                  'Social support: Substance misuse support',
                support_for_social_isolation_other_social_support_18_and_over:
                  'Social support: Support for social isolation or other reason',
                support_with_memory_and_cognition_18_and_over:
                  'Support with memory and cognition',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
            >
              <p className="govuk-body-m">(*) denotes less than 5</p>
            </DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="primary_reasons_for_accessing_care.csv"
                xLabel=""
              />
            </>
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Disability prevalence"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/disability-prevalence"
        />
        <DataLinkCard
          label="Learning disability prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/learning-disability-prevalence"
        />
        <DataLinkCard
          label="People who reported bad or very bad health"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/people-who-reported-bad-or-very-bad-health"
        />
        <DataLinkCard
          label="Primary reason for people to access long-term adult social care"
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/primary-reason-for-accessing-long-term-adult-social-care"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence and estimated diagnosis rate"
          description="Data on registered dementia diagnoses with estimates for undiagnosed dementia."
          url="/topics/population-needs/dementia-prevalence/data"
        />
        <DataLinkCard
          label="Economic factors and household composition"
          description="Data on household deprivation, property ownership and older people living alone."
          url="/topics/population-needs/household-composition-and-economic-factors/data"
        />
        <DataLinkCard
          label="Population size and age group percentages"
          description="Population data at district, local authority, regional and national levels for England."
          url="/topics/population-needs/population-age-and-size/data"
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
