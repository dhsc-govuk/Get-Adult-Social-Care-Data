'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useState } from 'react';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import CategoryBreakdownSection from '@/components/data-components/CategoryBreakdownSection';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import TableService from '@/services/Table/TableService';
import AnalyticsService from '@/services/analytics/analyticsService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { COMPARATOR_AVERAGE_LOCATION_TYPE } from '@/components/charts/peer-group/constants';
import { mergeComparatorTotals } from '@/helpers/categoryBreakdown';
import {
  CQC_RATING_CATEGORIES,
  CQC_RATING_COUNT_METRIC_IDS,
  CQC_RATING_METRIC_IDS,
  NUM_CQC_INSPECTED_LOCATIONS,
} from '@/data/cqcMetrics';
import { METRICS } from '@/config/metrics';

const COUNTRY_LABEL = 'England (national)';

export default function CQCRatingsPage() {
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
      text: 'Quality of care',
      url: '/topics/quality-of-care/subtopics',
    },
  ];

  const metricPage = 'cqc-ratings';
  const laCode = locationIds[1];

  const comparator = useComparatorControls({ laCode, metricPage });
  // The comparison group's figures are its members' counts summed, so only the
  // counts are fetched for it; the percentages are derived from those sums
  const {
    dataByMetric,
    loading: peerLoading,
    error: peerError,
  } = usePeerGroupData(
    laCode,
    CQC_RATING_COUNT_METRIC_IDS,
    comparator.selection,
    comparator.groups
  );
  // A chart needs both the comparator data and the user's own LA / England
  // values before it is complete, so it waits for (and fails on) either
  // request rather than rendering comparison bars without the user's authority.
  const chartLoading = peerLoading || baseDataStatus === 'loading';
  const chartError = peerError || baseDataStatus === 'error';
  // The columns show totals rather than averages, as a count of locations
  // reads naturally next to England's total
  const tableColumnHeaders = {
    CPLabel: locationNames.CPLabel,
    LALabel: locationNames.LALabel,
    RegionLabel: `${locationNames.RegionLabel} (regional total)`,
    ComparatorLabel: comparator.comparatorTotalLabel,
    CountryLabel: COUNTRY_LABEL,
  };
  const bars = [
    { label: locationNames.LALabel, locationType: 'LA' },
    {
      label: comparator.comparatorTotalLabel,
      locationType: COMPARATOR_AVERAGE_LOCATION_TYPE,
    },
    { label: COUNTRY_LABEL, locationType: 'National' },
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
    CQC_RATING_METRIC_IDS.forEach((metric_id) => {
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
            CountryLabel: COUNTRY_LABEL,
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
        metric_ids: CQC_RATING_METRIC_IDS,
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

  // The true Regional rows are preserved and the selected comparison group's
  // totals are added as separate ComparatorAverage rows. Derived synchronously
  // so the table can never show a stale or mislabelled value: while comparator
  // data is unresolved (loading or failed), the comparator column is null and
  // renders as unavailable.
  const filteredDemographicData = useMemo(
    () =>
      mergeComparatorTotals(
        baseDemographicData,
        CQC_RATING_CATEGORIES,
        NUM_CQC_INSPECTED_LOCATIONS,
        dataByMetric,
        locationIds[2],
        comparator.comparatorIsRegion,
        locationIds[1]
      ),
    [
      baseDemographicData,
      dataByMetric,
      locationIds,
      comparator.comparatorIsRegion,
    ]
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

  const comparedLocations = (
    <>
      {locationNames.LALabel} <abbr title="local authority">LA</abbr>,{' '}
      {comparator.comparatorTotalLabel} and {COUNTRY_LABEL}, all service types,{' '}
      {IndicatorService.getMostRecentDate(filteredDemographicData)}
    </>
  );

  return (
    <Layout
      title="CQC ratings of adult social care locations"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="cqc-ratings"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            CQC ratings of adult social care locations
          </h1>
          <p className="govuk-body-l">
            Data on CQC ratings of adult social care locations, including number
            and percentage of locations by CQC rating, number and percentage not
            yet inspected, and date of latest inspection.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <CategoryBreakdownSection
        id="1"
        title="CQC ratings of inspected adult social care locations"
        intro={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(METRICS[NUM_CQC_INSPECTED_LOCATIONS].helpUrl)}
              className="govuk-link"
            >
              how the percentage of inspected adult social care locations by CQC
              rating is calculated
            </a>
            .
          </p>
        }
        sharingMetricIds={CQC_RATING_METRIC_IDS}
        categoryColumnName="CQC rating"
        categories={CQC_RATING_CATEGORIES}
        total={{
          label: 'All inspected locations',
          metric: NUM_CQC_INSPECTED_LOCATIONS,
        }}
        data={filteredDemographicData}
        columnHeaders={tableColumnHeaders}
        bars={bars}
        laName={locationNames.LALabel}
        figureNumber={1}
        figureTitle="number and percentage of adult social care locations by CQC rating"
        comparisonSummary={comparedLocations}
        tableCaption={
          <>
            Table 1: number and percentage of adult social care locations by CQC
            rating &ndash; {comparedLocations}
          </>
        }
        download={{
          filename: 'cqc_ratings_of_adult_social_care_locations.csv',
          description: 'CQC ratings of adult social care locations',
        }}
        comparator={comparator}
        loading={chartLoading}
        error={chartError}
      />
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="CQC ratings of adult social care locations"
          sources="Care Quality Commission"
          updateFrequency="Monthly updates"
          limitations={true}
          url={METRICS[NUM_CQC_INSPECTED_LOCATIONS].helpUrl}
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care provider services"
          description="Data on care provision by service type and number of providers."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
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
