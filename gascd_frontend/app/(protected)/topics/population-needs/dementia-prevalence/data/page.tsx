'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
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
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';

export default function DementaPrevalencePage() {
  const tableref1 = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>({
    CPLabel: null,
    LALabel: 'Loading...',
    RegionLabel: 'NHS peer group average',
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
  const [peerGroupAverages, setPeerGroupAverages] = useState<{
    [key: string]: number | null;
  }>({});

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

  // Metrics with NHS peer group benchmarking
  const benchmarkedMetricIds = ['dementia_qof_prevalence'];

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
          setLocationNames({
            CPLabel: locationNames.CPLabel,
            LALabel: locationNames.LALabel,
            RegionLabel: 'NHS peer group average',
            CountryLabel: 'England (national average)',
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

        // Replace Regional values with the NHS peer group average. While the
        // peer average is still loading, null the value so the raw regional
        // figure is never shown under the peer group column header.
        const transformedData = filteredDemographicData.map((d: Indicator) => {
          if (
            d.location_type === 'Regional' &&
            benchmarkedMetricIds.includes(d.metric_id)
          ) {
            return {
              ...d,
              data_point: peerGroupAverages[d.metric_id] ?? null,
            };
          }
          return d;
        });

        setFilteredDemographicData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery, peerGroupAverages]);

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
    const fetchPeerGroupAverages = async () => {
      if (!locationIds.length || locationIds.length < 2) return;
      try {
        const laCode = locationIds[1];

        const results = await Promise.all(
          benchmarkedMetricIds.map(async (metricId) => {
            try {
              const response = await fetch(
                withBasePath(
                  `/api/get_la_peers?la_code=${encodeURIComponent(laCode)}&metric_code=${metricId}`
                )
              );
              if (response.ok) {
                const data = await response.json();
                return [
                  metricId,
                  data?.averagePeerGroup ??
                    data?.AveragePeerGroup ??
                    data?.average_peer_group ??
                    null,
                ] as const;
              }
            } catch (error) {
              console.error(
                `Error fetching peer group data for ${metricId}:`,
                error
              );
            }
            return [metricId, null] as const;
          })
        );

        setPeerGroupAverages(Object.fromEntries(results));
      } catch (error) {
        console.error('Error fetching peer group averages:', error);
      }
    };

    fetchPeerGroupAverages();
  }, [locationIds]);

  return (
    <Layout
      title="Dementia prevalence"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Dementia prevalence</h1>
          <p className="govuk-body-l">
            Data estimates for undiagnosed dementia.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Dementia prevalence"
        dataInfo={
          <>
            <p className="govuk-body">
              Find out{' '}
              <a href={withBasePath('/help/dementia-prevalence')} className="govuk-link">
                how dementia prevalence is calculated
              </a>
              .
            </p>
            <details className="govuk-details govuk-!-margin-top-3">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Interpreting the NHS Peer Group
                </span>
              </summary>
              <div className="govuk-details__text">
                GASCD currently uses a{' '}
                <a
                  className="govuk-link"
                  href="https://github.com/NHSDigital/ASC_LA_Peer_Groups"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  statistical neighbours model
                </a>{' '}
                developed by NHS digital in 2022/23 to support benchmarking.
                This is one of a number of approaches that aim to group
                authorities with similar socio-economic and geographic factors
                (e.g. age, ethnicity, education). It is important to note that
                there is limited evidence of which factors are the most
                important drivers of variation in adult social care. As a
                result, these statistical neighbours should be viewed as a
                helpful starting point for benchmarking, rather than a
                definitive indication of which authorities are most alike or
                measuring relative performance.
              </div>
            </details>
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
                  Table 1: dementia prevalence – {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} and {locationNames.CountryLabel},{' '}
                  {IndicatorService.getMostRecentDate(filteredDemographicData)}
                </>
              }
              source={
                'Fingertips from the Department of Health and Social Care (DHSC)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                dementia_qof_prevalence:
                  'Dementia prevalence - all ages, as a proportion of people registered at GP practices',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['dementia_qof_prevalence']}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="dementia_prevalence_and_diagnosis_rate.csv"
                xLabel=""
                downloadType="dementia prevalence and the dementia diagnosis rate"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'dementia_qof_prevalence' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'dementia_qof_prevalence' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              metricCode="dementia_qof_prevalence"
              metricDescription="dementia prevalence in all ages, as a proportion of people registered at GP practices"
              figureTitle="Dementia prevalence - all ages, as a proportion of people registered at GP practices"
              figureNumber={1}
              source="Fingertips from the Department of Health and Social Care (DHSC)"
            />
          }
        />
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Dementia prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/dementia-prevalence"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Economic factors and household composition"
          description="Data on household deprivation, property ownership and older people living alone."
          url="/topics/population-needs/household-composition-and-economic-factors/data"
        />
        <DataLinkCard
          label="General health and disability"
          description="Data on disability prevalence, learning disability diagnoses and reasons for accessing care."
          url="/topics/population-needs/disability-prevalence/data"
        />
        <DataLinkCard
          label="Population size and age group percentages"
          description="Population data at LA, regional and national levels for England."
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
