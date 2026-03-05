'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import SubCatergoryTable from '@/components/tables/SubCatergoryTable';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import AnalyticsService from '@/services/analytics/analyticsService';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';

export default function LAFundingPage() {
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

  const metricColumnNames = ['Duration of care', 'Care type or funding method'];

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Funding',
      url: '/topics/Funding/subtopics',
    },
  ];

  const demographicMetricIds = [
    'edpsr_lt_learning_disability_support_all_ages',
    'edpsr_lt_mental_health_support_all_ages',
    'edpsr_lt_physical_support_all_ages',
    'edpsr_lt_sensory_support_all_ages',
    'edpsr_lt_support_with_memory_and_cognition_all_ages',
    'edpsr_lt_total_all_ages',
    'edpsr_st_learning_disability_support_all_ages',
    'edpsr_st_mental_health_support_all_ages',
    'edpsr_st_physical_support_all_ages',
    'edpsr_st_sensory_support_all_ages',
    'edpsr_st_support_with_memory_and_cognition_all_ages',
    'edpsr_st_total_all_ages',
    'edpsr_stlt_total_all_ages',

    'elss_all_types_of_care_home_all_ages',
    'elss_all_types_of_adult_social_care_all_ages',
    'elss_all_types_of_community_social_care_all_ages',
    'elss_community_direct_payments_all_ages',
    'elss_community_home_care_all_ages',
    'elss_community_other_long_term_care_all_ages',
    'elss_community_supported_living_all_ages',
    'elss_nursing_all_ages',
    'elss_residential_all_ages',
    'elss_supported_accommodation_all_ages',
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
            RegionLabel: `${locationNames.RegionLabel} - regional average`,
            CountryLabel: `${locationNames.CountryLabel} - national average`,
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

        filteredDemographicData.forEach((indicator) => {
          if (indicator.data_point !== null) indicator.data_point *= 1000;
        });
        setFilteredDemographicData(filteredDemographicData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery]);

  return (
    <Layout
      title="Local Authority funding for adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            <abbr title="Local Authority">LA</abbr> funding for adult social
            care
          </h1>
          <p className="govuk-body-l">
            Data on funding for both short-term and long-term care, also funding
            by individual care type.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> adult social care funding by
            duration of care
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href="/help/percentages-financial-spend-long-term-and-short-term-care"
              className="govuk-link"
            >
              how the financial spend for short-term and long-term care is
              calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="1"
          table={
            <SubCatergoryTable
              tableref={tableref1}
              caption={
                <>
                  Table 1: <abbr title="Local Authority">LA</abbr> spending on
                  short-term and long-term adult social care for all age groups
                  – {locationNames.LALabel} local authority,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getFinancialYear(filteredDemographicData)}
                </>
              }
              source={
                'Adult Social Care Activity and Finance Report from NHS England'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName={metricColumnNames[0]}
              rowHeaders={{
                edpsr_stlt_total_all_ages: 'Both short-term and long-term',
                edpsr_lt_total_all_ages: 'Long-term',
                edpsr_lt_learning_disability_support_all_ages:
                  'Learning disability support',
                edpsr_lt_mental_health_support_all_ages:
                  'Mental health support',
                edpsr_lt_physical_support_all_ages: 'Physical support',
                edpsr_lt_sensory_support_all_ages: 'Sensory support',
                edpsr_lt_support_with_memory_and_cognition_all_ages:
                  'Support with memory and cognition',
                edpsr_st_total_all_ages: 'Short-term',
                edpsr_st_learning_disability_support_all_ages:
                  'Learning disability support',
                edpsr_st_mental_health_support_all_ages:
                  'Mental health support',
                edpsr_st_physical_support_all_ages: 'Physical support',
                edpsr_st_sensory_support_all_ages: 'Sensory support',
                edpsr_st_support_with_memory_and_cognition_all_ages:
                  'Support with memory and cognition',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
              totalsRows={[
                'edpsr_stlt_total_all_ages',
                'edpsr_lt_total_all_ages',
                'edpsr_st_total_all_ages',
              ]}
            ></SubCatergoryTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="social_care_funding_by_duration.csv"
                xLabel=""
                downloadType="LA spending on short-term and long-term adult social care for all age groups"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> funding for long-term adult
            social care
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href="/help/total-financial-spend-adult-social-care"
              className="govuk-link"
            >
              how the financial spend is calculated by service type
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="2"
          table={
            <SubCatergoryTable
              tableref={tableref2}
              caption={
                <>
                  Table 2: <abbr title="Local Authority">LA</abbr> funding for
                  long-term adult social care for all age groups –{' '}
                  {locationNames.LALabel} local authority,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getFinancialYear(filteredDemographicData)}
                </>
              }
              source={
                'Adult Social Care Activity and Finance Report from NHS England'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName={metricColumnNames[1]}
              rowHeaders={{
                elss_all_types_of_adult_social_care_all_ages:
                  'All types of adult social care',
                elss_all_types_of_care_home_all_ages:
                  'All types of care home, including residential and nursing',
                elss_nursing_all_ages: 'Residential',
                elss_residential_all_ages: 'Nursing',
                elss_all_types_of_community_social_care_all_ages:
                  'All types of community social care, including home care, supported living, community direct payments and other schemes',
                elss_community_home_care_all_ages: 'Home care',
                elss_community_supported_living_all_ages: 'Supported living',
                elss_community_direct_payments_all_ages:
                  'Community direct payments',
                elss_community_other_long_term_care_all_ages: 'Other',
                elss_supported_accommodation_all_ages: 'Supported accomodation',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
              totalsRows={[
                'elss_all_types_of_adult_social_care_all_ages',
                'elss_all_types_of_care_home_all_ages',
                'elss_all_types_of_community_social_care_all_ages',
                'elss_supported_accommodation_all_ages',
              ]}
            ></SubCatergoryTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="funding_for_long_term_adult_social_care.csv"
                xLabel=""
                downloadType="LA funding for long-term adult social care for all age groups"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label={
            <>
              <abbr title="Local Authority">LA</abbr> funding for adult social
              care
            </>
          }
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/total-financial-spend-adult-social-care"
        />
        <DataLinkCard
          label={
            <>
              <abbr title="Local Authority">LA</abbr> funding for long-term
              community adult social care
            </>
          }
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/total-financial-spend-long-term-community-adult-social-care"
        />
        <DataLinkCard
          label={
            <>
              <abbr title="Local Authority">LA</abbr> funding for short-term and
              long term adult social care
            </>
          }
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/percentages-financial-spend-long-term-and-short-term-care"
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
