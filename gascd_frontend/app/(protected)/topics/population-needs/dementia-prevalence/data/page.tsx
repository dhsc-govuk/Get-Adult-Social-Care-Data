'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useState } from 'react';
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
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import MetricSection from '@/components/data-components/MetricSection';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { METRICS } from '@/config/metrics';

const PREVALENCE = 'dementia_qof_prevalence';

export default function DementaPrevalencePage() {
  const [locationNames, setLocationNames] = useState<LocationNames>({
    CPLabel: null,
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [baseDemographicData, setBaseDemographicData] = useState<Indicator[]>(
    []
  );
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  // Status of the metric-data request that supplies the user's LA and England
  // values. Starts as loading because the query cannot be built until the
  // location ids resolve.
  const [baseDataStatus, setBaseDataStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');

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
    PREVALENCE,
    'dementia_estimated_diagnosis_rate_65over',
  ];

  // Metrics with peer group / custom comparator benchmarking
  const benchmarkedMetricIds = [PREVALENCE];

  const metricPage = 'dementia-prevalence';
  const laCode = locationIds[1];

  const comparator = useComparatorControls({ laCode, metricPage });
  const {
    dataByMetric,
    loading: peerLoading,
    error: peerError,
  } = usePeerGroupData(
    laCode,
    benchmarkedMetricIds,
    comparator.selection,
    comparator.groups
  );
  // A chart needs both the comparator data and the user's own LA / England
  // values before it is complete, so it waits for (and fails on) either
  // request rather than rendering peer bars without the user's authority.
  const chartLoading = peerLoading || baseDataStatus === 'loading';
  const chartError = peerError || baseDataStatus === 'error';
  const tableColumnHeaders = {
    CPLabel: locationNames.CPLabel,
    LALabel: locationNames.LALabel,
    RegionLabel: `${locationNames.RegionLabel} (regional average)`,
    ComparatorLabel: comparator.comparatorAverageLabel,
    CountryLabel: locationNames.CountryLabel,
  };

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
            RegionLabel: locationNames.RegionLabel,
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
    let cancelled = false;
    const fetchAllData = async () => {
      if (!CPLocationId || demographicQuery.metric_ids.length === 0) return;
      setBaseDataStatus('loading');
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        if (cancelled) return;
        setBaseDemographicData(TableService.filterDate(demographicData));
        setBaseDataStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching data:', error);
        setBaseDataStatus('error');
      }
    };
    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, [demographicQuery, CPLocationId]);

  // The true Regional row is preserved and the selected comparison group's
  // average is added as a separate ComparatorAverage column (synthesised if
  // the metrics API returned no Regional row for the metric). Derived
  // synchronously so the table can never show a stale or mislabelled value:
  // while comparator data is unresolved (loading or failed), the comparator
  // column is null and renders as unavailable.
  const filteredDemographicData = useMemo(
    () =>
      mergeComparatorAverage(
        baseDemographicData,
        benchmarkedMetricIds,
        dataByMetric,
        locationIds[2]
      ),
    [baseDemographicData, dataByMetric, locationIds]
  );

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
      title="Dementia prevalence"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Dementia prevalence</h1>
          <p className="govuk-body-l">Data on dementia prevalence.</p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <MetricSection
        id="1"
        title="Dementia prevalence"
        metric={PREVALENCE}
        intro={
          <>
            <p className="govuk-body">
              Find out{' '}
              <a
                href={withBasePath(METRICS[PREVALENCE].helpUrl)}
                className="govuk-link"
              >
                how dementia prevalence is calculated
              </a>
              .
            </p>
          </>
        }
        sharingMetricIds={demographicMetricIds}
        figureNumber={1}
        metricDescription="dementia prevalence in all ages, as a proportion of people registered at GP practices"
        tableCaption={
          <>
            Table 1: dementia prevalence – {locationNames.LALabel}{' '}
            <abbr title="local authority">LA</abbr>, {locationNames.RegionLabel}{' '}
            (regional average), {tableColumnHeaders.ComparatorLabel} and{' '}
            {locationNames.CountryLabel},{' '}
            {IndicatorService.getMostRecentDate(filteredDemographicData)}
          </>
        }
        columnHeaders={tableColumnHeaders}
        download={{
          filename: 'dementia_prevalence_and_diagnosis_rate.csv',
          description: 'dementia prevalence and the dementia diagnosis rate',
        }}
        data={filteredDemographicData}
        laCode={locationIds[1]}
        laName={locationNames.LALabel}
        regionLabel={locationNames.RegionLabel}
        comparator={comparator}
        peer={{
          dataByMetric: dataByMetric,
          loading: chartLoading,
          error: chartError,
        }}
      />
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Dementia prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url={METRICS[PREVALENCE].helpUrl}
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
