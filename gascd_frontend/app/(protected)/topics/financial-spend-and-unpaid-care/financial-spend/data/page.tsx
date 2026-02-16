'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import DataTable from '@/components/tables/table';
import SubCatergoryTable from '@/components/tables/SubCatergoryTable';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import AnalyticsService from '@/services/analytics/analyticsService';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';

export default function LAFundingPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);

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
                  {locationNames.CountryLabel}
                </>
              }
              source={
                'Adult Social Care Activity and Finance Report from NHS England'
              }
              columnHeaders={locationNamesWithAverageLabels}
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
                filename="general_health_and_disability.csv"
                xLabel=""
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
      ></DataBox>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l govuk-!-margin-top-9">Trends</h2>
        </div>
      </div>

      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> funding for long-term adult
            social care – trends over time
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href="/help/total-financial-spend-long-term-community-adult-social-care"
              className="govuk-link"
            >
              how the financial spend on long-term adult social care is
              calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="3"
          table={
            <DataTable
              tableref={tableref3}
              caption={
                <>
                  Table 3: <abbr title="Local Authority">LA</abbr> funding for
                  long-term adult social care (all types of adult social care)
                  for all age groups – {locationNames.LALabel} local authority,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel}
                </>
              }
              source={
                'Adult Social Care Activity and Finance Report from NHS England'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName={metricColumnNames[2]}
              rowHeaders={{
                2023_2024: '2023 to 2024',
                2022_2023: '2022 to 2023',
                2021_2022: '2021 to 2022',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="funding_for_long_term_adult_social_care.csv"
                xLabel=""
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
