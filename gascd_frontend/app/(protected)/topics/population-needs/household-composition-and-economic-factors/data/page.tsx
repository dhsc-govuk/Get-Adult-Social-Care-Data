'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import AnalyticsService from '@/services/analytics/analyticsService';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import MetricSection from '@/components/data-components/MetricSection';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { METRICS } from '@/config/metrics';
import { chartLocationValues } from '@/helpers/locationComparison';

export default function ProvisionAndOccupancyPage() {
  const tableref1 = useRef<HTMLTableElement>(null);

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
    'perc_households_deprivation_deprived',
    'perc_household_ownership',
    'perc_households_one_person',
  ];

  const metricPage = 'household-composition-and-economic-factors';
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
      title="Economic factors and household composition"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Economic factors and household composition
          </h1>
          <p className="govuk-body-l">
            Data on household deprivation, property ownership and older people
            living alone.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Household deprivation"
        dataInfo={
          <p className="govuk-body-m">
            In Census 2021, households were classified by 4 dimensions of
            deprivation: education, employment, health and disability, and
            household overcrowding.
          </p>
        }
      >
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              How the 4 dimensions of deprivation are measured
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              All the following characteristics must apply for a household to be
              classified as &lsquo;deprived in 4 dimensions&rsquo; in Census
              2021 data.
            </p>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>
                No one in the household has at least level 2 education and no
                one aged 16 to 18 years is a full-time student.
              </li>
              <li>
                A household member is unemployed or economically inactive due to
                long-term sickness or disability, and is not a full-time
                student.
              </li>
              <li>
                Any member of the household has general health that is bad or
                very bad, or is identified as disabled.
              </li>
              <li>
                The household&apos;s accommodation is overcrowded, is in a
                shared dwelling, or has no central heating.
              </li>
            </ol>
            <Link
              className="govuk-link"
              href={METRICS.perc_households_deprivation_deprived.helpUrl}
            >
              More details on household deprivation data.
            </Link>
          </div>
        </details>
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
            developed by NHS digital in 2022/23 to support benchmarking. This is
            one of a number of approaches that aim to group authorities with
            similar socio-economic and geographic factors (e.g. age, ethnicity,
            education). It is important to note that there is limited evidence
            of which factors are the most important drivers of variation in
            adult social care. As a result, these statistical neighbours should
            be viewed as a helpful starting point for benchmarking, rather than
            a definitive indication of which authorities are most alike or
            measuring relative performance.
          </div>
        </details>
        <DataTabs
          id="1"
          sharingMetricIds={['perc_households_deprivation_deprived']}
          table={
            <>
              {comparator.renderComparatorControl('comparator-table-1')}
              <DataTable
                metrics={['perc_households_deprivation_deprived']}
                tableref={tableref1}
                caption={`Table 1: percentage of households classified as 'deprived in 4 dimensions' – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} (regional average), ${tableColumnHeaders.ComparatorLabel} and ${locationNames.CountryLabel}, Census 2021`}
                columnHeaders={tableColumnHeaders}
                data={filteredDemographicData}
                showCareProvider={false}
                showAverageLabel={false}
              ></DataTable>
            </>
          }
          download={
            <>
              <div className="govuk-!-margin-bottom-4">
                {comparator.renderComparatorControl('comparator-download-1')}
              </div>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="households_deprived_in_4_dimensions.csv"
                xLabel=""
                downloadType="percentage of households classified as 'deprived in 4 dimensions'"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={locationIds[1]}
              laName={locationNames.LALabel}
              metric={'perc_households_deprivation_deprived'}
              {...chartLocationValues(
                filteredDemographicData,
                'perc_households_deprivation_deprived'
              )}
              regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
              peerData={
                dataByMetric['perc_households_deprivation_deprived'] ?? null
              }
              loading={chartLoading}
              error={chartError}
              comparatorControl={comparator.renderComparatorControl(
                'comparator-chart-1'
              )}
              comparatorLabel={comparator.comparatorLabel}
              comparatorAverageLabel={comparator.comparatorAverageLabel}
              metricDescription="the percentage of households deprived in 4 dimensions"
              figureTitle="Percentage of households deprived in 4 dimensions"
            />
          }
        />
      </DataBox>
      <MetricSection
        id="2"
        title="Households where the property is owned outright"
        metric={'perc_household_ownership'}
        intro={
          <>
            <p className="govuk-body-m">
              This is when the property does not have an outstanding mortgage or
              any other type of loan attached to it.
            </p>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(METRICS.perc_household_ownership.helpUrl)}
                className="govuk-link"
              >
                how data on property ownership is collected
              </a>
            </p>
          </>
        }
        figureNumber={2}
        metricDescription="the percentage of households where the property is owned outright"
        tableCaption={`Table 2: percentage of households where the property is owned outright – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} (regional average), ${tableColumnHeaders.ComparatorLabel} and ${locationNames.CountryLabel}, Census 2021`}
        columnHeaders={tableColumnHeaders}
        download={{
          filename: 'property_owned_outright.csv',
          description:
            'percentage of households where the property is owned outright',
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
      <MetricSection
        id="3"
        title="One-person households where the person is aged 65 or over"
        metric={'perc_households_one_person'}
        intro={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(METRICS.perc_households_one_person.helpUrl)}
                className="govuk-link"
              >
                how the percentage of one-person households where the person is
                aged 65 or over is calculated
              </a>
            </p>
          </>
        }
        figureNumber={3}
        metricDescription="the percentage of one-person households where the person is aged 65 or over"
        tableCaption={`Table 3: percentage of one-person households where the person is aged 65 or over – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} (regional average), ${tableColumnHeaders.ComparatorLabel} and ${locationNames.CountryLabel}, Census 2021`}
        columnHeaders={tableColumnHeaders}
        download={{
          filename: 'one_person_households_over_65.csv',
          description:
            'percentage of one-person households where the person is aged 65 or over',
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
          label="Households &lsquo;deprived in 4 dimensions&rsquo;"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url={METRICS.perc_households_deprivation_deprived.helpUrl}
        />
        <DataLinkCard
          label="Households where the property is owned outright"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url={METRICS.perc_household_ownership.helpUrl}
        />
        <DataLinkCard
          label="One-person households where the person is aged 65 or over"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={false}
          url={METRICS.perc_households_one_person.helpUrl}
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence"
          description="Data on dementia prevalence."
          url="/topics/population-needs/dementia-prevalence/data"
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
