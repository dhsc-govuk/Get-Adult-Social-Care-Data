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
import Link from 'next/link';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';

export default function LAFundingPage() {
  const tableref1 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
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
      title="Local Authority funding for adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
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
      ></DataBox>
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
      ></DataBox>

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
