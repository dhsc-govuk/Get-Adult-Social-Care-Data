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
import Link from 'next/link';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';

export default function DementaPrevalencePage() {
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
    'dementia_qof_prevalence',
    'dementia_estimated_diagnosis_rate_65over',
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

  return (
    <Layout
      title="Dementia prevalence and estimated diagnosis rate"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Dementia prevalence and estimated diagnosis rate
          </h1>
          <p className="govuk-body-l">
            Data on registered dementia diagnoses with estimates for undiagnosed
            dementia.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Dementia prevalence and estimated diagnosis rate"
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a href="/help/dementia-prevalence" className="govuk-link">
                demetial prevalence
              </a>{' '}
              and{' '}
              <a
                href="/help/estimated-dementia-diagnosis-rate-aged-65-and-over"
                className="govuk-link"
              >
                estimated dementia diagnosis rate for people aged 65 and over
              </a>{' '}
              are calculated.
            </p>
          </>
        }
      >
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              What &lsquo;dementia diagnosis rate&rsquo; means
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              The &lsquo;dementia diagnosis rate&rsquo; is found by dividing the
              number of people with a formal diagnosis of dementia by the
              estimated number of people expected to have dementia.
            </p>
            <p>
              The estimated number of people expected to have dementia is worked
              out by combining:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the characteristics of the local registered population</li>
              <li>studies on dementia prevalence by age and sex</li>
            </ul>
            <Link
              className="govuk-link"
              href="https://fingertips.phe.org.uk/dementia#page/6/gid/1938132811/ati/15/iid/92949/age/27/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1"
            >
              Read a more detailed explanation of how &lsquo;dementia diagnosis
              rate&rsquo; is calculated (opens in new tab).
            </Link>
          </div>
        </details>
        <DataTabs
          id="1"
          table={
            <DataTable
              caption={`Table 1: dementia prevalence and the dementia diagnosis rate – ${locationNames.LALabel} local authority, ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, August 2025`}
              source={
                'Fingertips from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                dementia_qof_prevalence:
                  'Dementia prevalence - all ages, as a proportion of people registered at GP practices',
                dementia_estimated_diagnosis_rate_65over:
                  'Estimated dementia diagnosis rate for people aged 65 and over',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[
                'dementia_qof_prevalence',
                'dementia_estimated_diagnosis_rate_65over',
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
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Dementia prevalence"
          sources="Department of Health and Social Care."
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/dementia-prevalence"
        />
        <DataLinkCard
          label="Estimated dementia diagnosis rate for people aged 65 and over"
          sources="Department of Health and Social Care."
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/estimated-dementia-diagnosis-rate-aged-65-and-over"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNames.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
