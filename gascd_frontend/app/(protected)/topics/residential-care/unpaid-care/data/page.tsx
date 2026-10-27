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

const UNPAID_CARE = 'perc_unpaid_care_provider';

export default function UnpaidCarePage() {
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
      text: 'Care provision',
      url: '/topics/residential-care/subtopics',
    },
  ];

  const demographicMetricIds = [UNPAID_CARE];

  const metricPage = 'unpaid-care';
  const laCode = locationIds[1];

  const comparator = useComparatorControls({ laCode, metricPage });
  const {
    dataByMetric,
    loading: peerLoading,
    error: peerError,
  } = usePeerGroupData(
    laCode,
    demographicMetricIds,
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
    RegionLabel: locationNames.RegionLabel,
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
        demographicMetricIds,
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
      title="Unpaid care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="unpaid-care"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Unpaid care</h1>
          <p className="govuk-body-l">
            Statistics on the people who provide unpaid care to family members,
            friends and neighbours.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <MetricSection
        id="1"
        title="People aged 5 and over who provide unpaid care"
        metric={UNPAID_CARE}
        intro={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(METRICS[UNPAID_CARE].helpUrl)}
              className="govuk-link"
            >
              how unpaid care is measured.
            </a>{' '}
          </p>
        }
        sharingMetricIds={demographicMetricIds}
        figureNumber={1}
        metricDescription="the percentage of people aged 5 and over who provide unpaid care"
        tableCaption={
          <>
            Table 1: percentage of people aged 5 and over who provide unpaid
            care – {locationNames.LALabel}{' '}
            <abbr title="local authority">LA</abbr>, {locationNames.RegionLabel}{' '}
            (regional average), {tableColumnHeaders.ComparatorLabel} and{' '}
            {locationNames.CountryLabel},{' '}
            {IndicatorService.getCensusYear(filteredDemographicData)}
          </>
        }
        columnHeaders={tableColumnHeaders}
        download={{
          filename: 'percent_unpaid_care.csv',
          description:
            'percentage of people aged 5 and over who provide unpaid care',
        }}
        data={filteredDemographicData}
        laCode={locationIds[1]}
        laName={locationNames.LALabel}
        regionLabel={locationNames.RegionLabel}
        comparator={comparator}
        peer={{ dataByMetric, loading: chartLoading, error: chartError }}
      />
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="People aged 5 and over who provide unpaid care"
          sources="Office for National Statistics."
          updateFrequency="Updated every 10 years"
          limitations={false}
          url={METRICS[UNPAID_CARE].helpUrl}
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
        />
        <DataLinkCard
          label="Care provider services"
          description="Data on residential care homes and nursing homes by service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Number of adults receiving community social care"
          description="Data on the number of people supported through community social care, including trends over time."
          url="/topics/residential-care/number-of-people-receiving-care/data"
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
