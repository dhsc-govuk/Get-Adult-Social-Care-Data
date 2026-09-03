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
import DataTable from '@/components/tables/table';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import AnalyticsService from '@/services/analytics/analyticsService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import {
  CIN_PER_10000_CHILDREN,
  CIN_SOURCE,
  CHILDREN_IN_NEED_METRIC_IDS,
  NUM_CHILDREN_IN_NEED,
  NUM_CIN_TRANSFER_ASC,
  TOTALLED_METRIC_IDS,
} from '@/data/dfeMetrics';
import {
  ComparatorLaCounts,
  comparisonLabels,
  locationTimeSeries,
  periodRows,
  seriesDates,
  toLaAverages,
} from '@/helpers/locationComparison';

const LOADING_LOCATION_NAMES = {
  CPLabel: 'N/A',
  LALabel: 'Loading...',
  RegionLabel: 'Loading...',
  CountryLabel: 'Loading...',
} as LocationNames;

/**
 * Children in need is collected for the reporting year ending 31 March, so a
 * series reported against 2024 covers the 2023 to 2024 reporting year.
 */
const reportingYearLabel = (year: string): string => {
  const endYear = Number(year);
  if (!Number.isFinite(endYear)) return year;
  return `${endYear - 1} to ${endYear}`;
};

const shortReportingYearLabel = (year: string): string => {
  const endYear = Number(year);
  if (!Number.isFinite(endYear)) return year;
  return `${endYear - 1}/${String(endYear).slice(-2)}`;
};

/** The x axis tick for each reporting year a series covers */
const reportingYearTicks = (data: Indicator[], metricId: string) => {
  const dates = seriesDates(data, metricId);
  return {
    tickValues: dates.map((date) => new Date(date).toISOString()),
    tickLabels: dates.map(shortReportingYearLabel),
  };
};

export default function ChildrenInNeedPage() {
  const numCinTable = useRef<HTMLTableElement>(null);
  const cinPer10000Table = useRef<HTMLTableElement>(null);
  const cinTransferTable = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>(
    LOADING_LOCATION_NAMES
  );
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [overTimeData, setOverTimeData] = useState<Indicator[]>([]);
  const [overTimeQuery, setOverTimeQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  // INTERIM (GASCD-236): comparator totals are converted to per-authority
  // averages in the browser until the pipeline writes averages
  const [laCounts, setLaCounts] = useState<ComparatorLaCounts | null>(null);

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Future planning',
      url: '/topics/future-planning/subtopics',
    },
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
    CHILDREN_IN_NEED_METRIC_IDS.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
  }, []);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          setLocationNames(
            await LocationService.getLocationNames(CPLocationId, false)
          );
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          setLocationIds(
            await LocationService.getLocationIds(CPLocationId, false)
          );
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setOverTimeQuery({
        metric_ids: CHILDREN_IN_NEED_METRIC_IDS,
        location_ids: locationIds,
        query_type: 'MultiLocationTimeseriesQuery',
      });
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchOverTimeData = async () => {
      if (!overTimeQuery.metric_ids.length) return;
      try {
        setOverTimeData(await IndicatorFetchService.getData(overTimeQuery));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchOverTimeData();
  }, [overTimeQuery]);


  // INTERIM (GASCD-236): see toLaAverages
  useEffect(() => {
    const fetchLaCounts = async () => {
      setLaCounts(await LocationService.getComparatorLaCounts());
    };
    fetchLaCounts();
  }, []);

  const columnLabels = useMemo(
    () => comparisonLabels(locationNames),
    [locationNames]
  );

  // Everything below reads the averaged data, so the charts, the tables and
  // the CSV export can never disagree
  const overTimeAverages = useMemo(
    () => toLaAverages(overTimeData, laCounts, TOTALLED_METRIC_IDS),
    [overTimeData, laCounts]
  );

  const numCinSeries = useMemo(
    () => locationTimeSeries(overTimeAverages, NUM_CHILDREN_IN_NEED, columnLabels),
    [overTimeAverages, columnLabels]
  );
  const cinPer10000Series = useMemo(
    () => locationTimeSeries(overTimeAverages, CIN_PER_10000_CHILDREN, columnLabels),
    [overTimeAverages, columnLabels]
  );
  const cinTransferSeries = useMemo(
    () => locationTimeSeries(overTimeAverages, NUM_CIN_TRANSFER_ASC, columnLabels),
    [overTimeAverages, columnLabels]
  );

  const numCinRows = useMemo(
    () => periodRows(overTimeAverages, NUM_CHILDREN_IN_NEED, reportingYearLabel),
    [overTimeAverages]
  );
  const cinPer10000Rows = useMemo(
    () => periodRows(overTimeAverages, CIN_PER_10000_CHILDREN, reportingYearLabel),
    [overTimeAverages]
  );
  const cinTransferRows = useMemo(
    () => periodRows(overTimeAverages, NUM_CIN_TRANSFER_ASC, reportingYearLabel),
    [overTimeAverages]
  );

  const comparedLocations = (
    <>
      {columnLabels.LALabel} <abbr title="local authority">LA</abbr>,{' '}
      {columnLabels.RegionLabel} and {columnLabels.CountryLabel}
    </>
  );

  const chartHeight = { width: '100%', height: '500px' };

  return (
    <Layout
      title="Children in need"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="children-in-need"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Children in need</h1>
          <p className="govuk-body-l">
            Data on Children in Need at{' '}
            <abbr title="local authority">LA</abbr>, regional and national
            levels for England.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>

      <DataBox
        dataTitle="Number of children in need"
        dataInfo={
          <p className="govuk-body">
            Find out{' '}
            <a
              href={withBasePath('/help/children-in-need')}
              className="govuk-link"
            >
              how the number of children in need is calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="1"
          sharingMetricIds={[NUM_CHILDREN_IN_NEED]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 1: Number of children and young people assessed as
                needing help and protection as a result of risks to their
                development or health under the Children Act 1989 -{' '}
                {comparedLocations}
              </h4>
              {(numCinSeries.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={numCinSeries}
                    decimalPoints={0}
                    hoverDateFormat="%Y"
                    {...reportingYearTicks(overTimeAverages, NUM_CHILDREN_IN_NEED)}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {CIN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={numCinTable}
              caption={
                <>
                  Table 1: Number of children and young people assessed as
                  needing help and protection as a result of risks to their
                  development or health under the Children Act 1989 -{' '}
                  {comparedLocations}
                </>
              }
              source={CIN_SOURCE}
              metricColumnName="Reporting year"
              columnHeaders={columnLabels}
              rowHeaders={numCinRows.rowHeaders}
              data={numCinRows.data}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={numCinTable}
                filename="number_of_children_in_need.csv"
                xLabel=""
                downloadType="Number of children in need"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Proportion of children in need"
        dataInfo={
          <p className="govuk-body">
            Find out{' '}
            <a
              href={withBasePath('/help/children-in-need-per-10000-children')}
              className="govuk-link"
            >
              how the proportion of children in need is calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="2"
          sharingMetricIds={[CIN_PER_10000_CHILDREN]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 2: Proportion of child population in England that is
                actively identified as a child in need (per 10,000) -{' '}
                {comparedLocations}
              </h4>
              {(cinPer10000Series.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={cinPer10000Series}
                    decimalPoints={1}
                    hoverDateFormat="%Y"
                    {...reportingYearTicks(
                      overTimeAverages,
                      CIN_PER_10000_CHILDREN
                    )}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {CIN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={cinPer10000Table}
              caption={
                <>
                  Table 2: Proportion of child population in England that is
                  actively identified as a child in need (per 10,000) -{' '}
                  {comparedLocations}
                </>
              }
              source={CIN_SOURCE}
              metricColumnName="Reporting year"
              columnHeaders={columnLabels}
              rowHeaders={cinPer10000Rows.rowHeaders}
              data={cinPer10000Rows.data}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={cinPer10000Table}
                filename="children_in_need_per_10000_children.csv"
                xLabel=""
                downloadType="Proportion of children in need"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Number of children in need episodes ending due to transfer to adult social care"
        dataInfo={
          <p className="govuk-body">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/children-in-need-episodes-ending-due-to-transfer-to-adult-social-care'
              )}
              className="govuk-link"
            >
              how the number of children in need episodes ending due to transfer
              to adult social care is calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="3"
          sharingMetricIds={[NUM_CIN_TRANSFER_ASC]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 3: Number of &ldquo;episodes of need&rdquo; for children
                and young people that were officially closed during a reporting
                year, ending due to transfer to adult social services -{' '}
                {comparedLocations}
              </h4>
              {(cinTransferSeries.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={cinTransferSeries}
                    decimalPoints={0}
                    hoverDateFormat="%Y"
                    {...reportingYearTicks(overTimeAverages, NUM_CIN_TRANSFER_ASC)}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {CIN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={cinTransferTable}
              caption={
                <>
                  Table 3: Number of &ldquo;episodes of need&rdquo; for children
                  and young people that were officially closed during a
                  reporting year, ending due to transfer to adult social
                  services - {comparedLocations}
                </>
              }
              source={CIN_SOURCE}
              metricColumnName="Reporting year"
              columnHeaders={columnLabels}
              rowHeaders={cinTransferRows.rowHeaders}
              data={cinTransferRows.data}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={cinTransferTable}
                filename="children_in_need_episodes_ending_due_to_transfer_to_adult_social_care.csv"
                xLabel=""
                downloadType="Number of children in need episodes ending due to transfer to adult social care"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Children in need"
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/children-in-need"
        />
        <DataLinkCard
          label="Children in need per 10,000 children"
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/children-in-need-per-10000-children"
        />
        <DataLinkCard
          label="Children in need episodes ending due to transfer to adult social care"
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/children-in-need-episodes-ending-due-to-transfer-to-adult-social-care"
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
