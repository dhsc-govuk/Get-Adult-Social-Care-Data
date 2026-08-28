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
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import TableService from '@/services/Table/TableService';
import AnalyticsService from '@/services/analytics/analyticsService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import {
  EHCP_SOURCE,
  NUM_EHCP_14PLUS,
  NUM_EHCP_BY_AGE,
  NUM_SEN_SUPPORT_14PLUS,
  NUM_SEN_SUPPORT_BY_AGE,
  PERC_SEN_SUPPORT_14PLUS,
  PERC_SEN_SUPPORT_BY_AGE,
  SEN_EHCP_METRIC_IDS,
  SEN_SOURCE,
  academicYearLabel,
  shortAcademicYearLabel,
} from '@/data/dfeMetrics';
import {
  comparisonLabels,
  locationBarSeries,
  locationTimeSeries,
  periodRows,
  seriesDates,
} from '@/helpers/locationComparison';

const LOADING_LOCATION_NAMES = {
  CPLabel: 'N/A',
  LALabel: 'Loading...',
  RegionLabel: 'Loading...',
  CountryLabel: 'Loading...',
} as LocationNames;

const OVER_TIME_METRIC_IDS = [
  NUM_SEN_SUPPORT_14PLUS,
  PERC_SEN_SUPPORT_14PLUS,
  NUM_EHCP_14PLUS,
];

const BY_AGE_METRIC_IDS = [
  ...Object.keys(NUM_SEN_SUPPORT_BY_AGE),
  ...Object.keys(PERC_SEN_SUPPORT_BY_AGE),
  ...Object.keys(NUM_EHCP_BY_AGE),
];

/** The x axis tick for each academic year a series covers, for example 2023/24 */
const academicYearTicks = (data: Indicator[], metricId: string) => {
  const dates = seriesDates(data, metricId);
  return {
    tickValues: dates.map((date) => new Date(date).toISOString()),
    tickLabels: dates.map(shortAcademicYearLabel),
  };
};

export default function SenAndEhcpPage() {
  const numSenOverTimeTable = useRef<HTMLTableElement>(null);
  const numSenByAgeTable = useRef<HTMLTableElement>(null);
  const percSenOverTimeTable = useRef<HTMLTableElement>(null);
  const percSenByAgeTable = useRef<HTMLTableElement>(null);
  const numEhcpOverTimeTable = useRef<HTMLTableElement>(null);
  const numEhcpByAgeTable = useRef<HTMLTableElement>(null);

  const [locationNames, setLocationNames] = useState<LocationNames>(
    LOADING_LOCATION_NAMES
  );
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [overTimeData, setOverTimeData] = useState<Indicator[]>([]);
  const [byAgeData, setByAgeData] = useState<Indicator[]>([]);
  const [overTimeQuery, setOverTimeQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [byAgeQuery, setByAgeQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

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
    SEN_EHCP_METRIC_IDS.forEach((metric_id) => {
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
        metric_ids: OVER_TIME_METRIC_IDS,
        location_ids: locationIds,
        query_type: 'MultiLocationTimeseriesQuery',
      });
      setByAgeQuery({
        metric_ids: BY_AGE_METRIC_IDS,
        location_ids: locationIds,
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

  useEffect(() => {
    const fetchByAgeData = async () => {
      if (!byAgeQuery.metric_ids.length) return;
      try {
        const data = await IndicatorFetchService.getData(byAgeQuery);
        setByAgeData(TableService.filterDate(data));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchByAgeData();
  }, [byAgeQuery]);

  const columnLabels = useMemo(
    () => comparisonLabels(locationNames),
    [locationNames]
  );

  // The academic year the age breakdowns cover, taken from the data so the
  // headings do not need updating when a new year is published
  const byAgeYear = useMemo(() => {
    const latest = IndicatorService.getMostRecentIndicator(
      byAgeData,
      BY_AGE_METRIC_IDS
    );
    return latest ? shortAcademicYearLabel(latest) : '';
  }, [byAgeData]);

  // Reads "within 2024/25 by age" once the year is known, and just "by age"
  // while the data is still loading
  const byAgePeriod = byAgeYear ? `within ${byAgeYear} by age` : 'by age';

  const numSenSeries = useMemo(
    () =>
      locationTimeSeries(overTimeData, NUM_SEN_SUPPORT_14PLUS, columnLabels),
    [overTimeData, columnLabels]
  );
  const percSenSeries = useMemo(
    () =>
      locationTimeSeries(overTimeData, PERC_SEN_SUPPORT_14PLUS, columnLabels),
    [overTimeData, columnLabels]
  );
  const numEhcpSeries = useMemo(
    () => locationTimeSeries(overTimeData, NUM_EHCP_14PLUS, columnLabels),
    [overTimeData, columnLabels]
  );

  const numSenRows = useMemo(
    () => periodRows(overTimeData, NUM_SEN_SUPPORT_14PLUS, academicYearLabel),
    [overTimeData]
  );
  const percSenRows = useMemo(
    () => periodRows(overTimeData, PERC_SEN_SUPPORT_14PLUS, academicYearLabel),
    [overTimeData]
  );
  const numEhcpRows = useMemo(
    () => periodRows(overTimeData, NUM_EHCP_14PLUS, academicYearLabel),
    [overTimeData]
  );

  const numSenByAgeSeries = useMemo(
    () =>
      locationBarSeries(
        byAgeData,
        Object.keys(NUM_SEN_SUPPORT_BY_AGE),
        columnLabels
      ),
    [byAgeData, columnLabels]
  );
  const percSenByAgeSeries = useMemo(
    () =>
      locationBarSeries(
        byAgeData,
        Object.keys(PERC_SEN_SUPPORT_BY_AGE),
        columnLabels
      ),
    [byAgeData, columnLabels]
  );
  const numEhcpByAgeSeries = useMemo(
    () =>
      locationBarSeries(byAgeData, Object.keys(NUM_EHCP_BY_AGE), columnLabels),
    [byAgeData, columnLabels]
  );

  const comparedLocations = (
    <>
      {columnLabels.LALabel} <abbr title="local authority">LA</abbr>,{' '}
      {columnLabels.RegionLabel} and {columnLabels.CountryLabel}
    </>
  );

  const chartHeight = { width: '100%', height: '500px' };

  const senSupportHelpLink = (
    <a
      href={withBasePath('/help/pupils-with-sen-support-aged-14-and-over')}
      className="govuk-link"
    >
      how the number of pupils with SEN support is calculated
    </a>
  );

  const percSenSupportHelpLink = (
    <a
      href={withBasePath(
        '/help/percentage-of-pupils-with-sen-support-aged-14-and-over'
      )}
      className="govuk-link"
    >
      how the percentage of pupils with SEN support is calculated
    </a>
  );

  const ehcpHelpLink = (
    <a
      href={withBasePath(
        '/help/children-and-young-people-with-an-ehcp-aged-14-and-over'
      )}
      className="govuk-link"
    >
      how the number of children and young people with an{' '}
      <abbr title="Education, Health and Care Plan">EHCP</abbr> is calculated
    </a>
  );

  return (
    <Layout
      title="Special Educational Needs (SEN) and Education, Health and Care Plans (EHCP)"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="sen-and-ehcp"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Special Educational Needs (SEN) and Education, Health and Care Plans
            (EHCP)
          </h1>
          <p className="govuk-body-l">
            Data on Special Educational Needs and Education, Health and Care
            Plans at <abbr title="local authority">LA</abbr>, regional and
            national levels for England.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>

      <DataBox
        dataTitle="Number of pupils with SEN support - trends over time"
        dataInfo={<p className="govuk-body">Find out {senSupportHelpLink}.</p>}
      >
        <DataTabs
          id="1"
          sharingMetricIds={[NUM_SEN_SUPPORT_14PLUS]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 1: Number of pupils aged 14+ who are identified as having
                a special educational need (SEN) over an academic year -{' '}
                {comparedLocations}
              </h4>
              {(numSenSeries.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={numSenSeries}
                    decimalPoints={0}
                    hoverDateFormat="%Y"
                    {...academicYearTicks(overTimeData, NUM_SEN_SUPPORT_14PLUS)}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {SEN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={numSenOverTimeTable}
              caption={
                <>
                  Table 1: Number of pupils aged 14+ who are identified as
                  having a special educational need (SEN) over an academic year
                  - {comparedLocations}
                </>
              }
              source={SEN_SOURCE}
              metricColumnName="Academic year"
              columnHeaders={columnLabels}
              rowHeaders={numSenRows.rowHeaders}
              data={numSenRows.data}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={numSenOverTimeTable}
                filename="number_of_pupils_with_sen_support_over_time.csv"
                xLabel=""
                downloadType="Number of pupils with SEN support - trends over time"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle={`Number of pupils with SEN support - by age${byAgeYear ? ` (${byAgeYear})` : ''}`}
        dataInfo={<p className="govuk-body">Find out {senSupportHelpLink}.</p>}
      >
        <DataTabs
          id="2"
          sharingMetricIds={Object.keys(NUM_SEN_SUPPORT_BY_AGE)}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 2: Number of pupils aged 14+ who are identified as having
                a special educational need (SEN) {byAgePeriod} -{' '}
                {comparedLocations}
              </h4>
              {(byAgeData.length > 0 && (
                <div style={chartHeight}>
                  <GroupedBarChart
                    categories={Object.values(NUM_SEN_SUPPORT_BY_AGE)}
                    series={numSenByAgeSeries}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {SEN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={numSenByAgeTable}
              caption={
                <>
                  Table 2: Number of pupils aged 14+ who are identified as
                  having a special educational need (SEN) {byAgePeriod} -{' '}
                  {comparedLocations}
                </>
              }
              source={SEN_SOURCE}
              metricColumnName="Age"
              columnHeaders={columnLabels}
              rowHeaders={NUM_SEN_SUPPORT_BY_AGE}
              data={byAgeData}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={numSenByAgeTable}
                filename="number_of_pupils_with_sen_support_by_age.csv"
                xLabel=""
                downloadType="Number of pupils with SEN support - by age"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Percentage of pupils with SEN support - trends over time"
        dataInfo={
          <p className="govuk-body">Find out {percSenSupportHelpLink}.</p>
        }
      >
        <DataTabs
          id="3"
          sharingMetricIds={[PERC_SEN_SUPPORT_14PLUS]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 3: Percentage of pupils aged 14+ who are identified as
                having a special educational need (SEN) over an academic year -{' '}
                {comparedLocations}
              </h4>
              {(percSenSeries.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={percSenSeries}
                    ySuffix="%"
                    decimalPoints={1}
                    hoverDateFormat="%Y"
                    {...academicYearTicks(
                      overTimeData,
                      PERC_SEN_SUPPORT_14PLUS
                    )}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {SEN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={percSenOverTimeTable}
              caption={
                <>
                  Table 3: Percentage of pupils aged 14+ who are identified as
                  having a special educational need (SEN) over an academic year
                  - {comparedLocations}
                </>
              }
              source={SEN_SOURCE}
              metricColumnName="Academic year"
              columnHeaders={columnLabels}
              rowHeaders={percSenRows.rowHeaders}
              data={percSenRows.data}
              percentageRows={Object.keys(percSenRows.rowHeaders)}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={percSenOverTimeTable}
                filename="percentage_of_pupils_with_sen_support_over_time.csv"
                xLabel=""
                downloadType="Percentage of pupils with SEN support - trends over time"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle={`Percentage of pupils with SEN support - by age${byAgeYear ? ` (${byAgeYear})` : ''}`}
        dataInfo={
          <p className="govuk-body">Find out {percSenSupportHelpLink}.</p>
        }
      >
        <DataTabs
          id="4"
          sharingMetricIds={Object.keys(PERC_SEN_SUPPORT_BY_AGE)}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 4: Percentage of pupils aged 14+ who are identified as
                having a special educational need (SEN) {byAgePeriod} -{' '}
                {comparedLocations}
              </h4>
              {(byAgeData.length > 0 && (
                <div style={chartHeight}>
                  <GroupedBarChart
                    categories={Object.values(PERC_SEN_SUPPORT_BY_AGE)}
                    series={percSenByAgeSeries}
                    ySuffix="%"
                    decimalPoints={1}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {SEN_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={percSenByAgeTable}
              caption={
                <>
                  Table 4: Percentage of pupils aged 14+ who are identified as
                  having a special educational need (SEN) {byAgePeriod} -{' '}
                  {comparedLocations}
                </>
              }
              source={SEN_SOURCE}
              metricColumnName="Age"
              columnHeaders={columnLabels}
              rowHeaders={PERC_SEN_SUPPORT_BY_AGE}
              data={byAgeData}
              percentageRows={Object.keys(PERC_SEN_SUPPORT_BY_AGE)}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={percSenByAgeTable}
                filename="percentage_of_pupils_with_sen_support_by_age.csv"
                xLabel=""
                downloadType="Percentage of pupils with SEN support - by age"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle={
          <>
            Number of children and young people in England with an{' '}
            <abbr title="Education, Health and Care Plan">EHCP</abbr> - trends
            over time
          </>
        }
        dataInfo={<p className="govuk-body">Find out {ehcpHelpLink}.</p>}
      >
        <DataTabs
          id="5"
          sharingMetricIds={[NUM_EHCP_14PLUS]}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 5: Number of children and young people aged 14+ who are
                identified as having a legally binding{' '}
                <abbr title="Education, Health and Care Plan">EHCP</abbr> over
                an academic year - {comparedLocations}
              </h4>
              {(numEhcpSeries.some((series) => series.data.length > 0) && (
                <div style={chartHeight}>
                  <TimeSeriesChart
                    series={numEhcpSeries}
                    decimalPoints={0}
                    hoverDateFormat="%Y"
                    {...academicYearTicks(overTimeData, NUM_EHCP_14PLUS)}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {EHCP_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={numEhcpOverTimeTable}
              caption={
                <>
                  Table 5: Number of children and young people aged 14+ who are
                  identified as having a legally binding{' '}
                  <abbr title="Education, Health and Care Plan">EHCP</abbr> over
                  an academic year - {comparedLocations}
                </>
              }
              source={EHCP_SOURCE}
              metricColumnName="Academic year"
              columnHeaders={columnLabels}
              rowHeaders={numEhcpRows.rowHeaders}
              data={numEhcpRows.data}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={numEhcpOverTimeTable}
                filename="number_of_children_and_young_people_with_an_ehcp_over_time.csv"
                xLabel=""
                downloadType="Number of children and young people with an EHCP - trends over time"
              />
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle={
          <>
            Number of children and young people in England with an{' '}
            <abbr title="Education, Health and Care Plan">EHCP</abbr> - by age
            {byAgeYear ? ` (${byAgeYear})` : ''}
          </>
        }
        dataInfo={<p className="govuk-body">Find out {ehcpHelpLink}.</p>}
      >
        <DataTabs
          id="6"
          sharingMetricIds={Object.keys(NUM_EHCP_BY_AGE)}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 6: Number of children and young people aged 14+ who are
                identified as having a legally binding{' '}
                <abbr title="Education, Health and Care Plan">EHCP</abbr>{' '}
                {byAgePeriod} - {comparedLocations}
              </h4>
              {(byAgeData.length > 0 && (
                <div style={chartHeight}>
                  <GroupedBarChart
                    categories={Object.values(NUM_EHCP_BY_AGE)}
                    series={numEhcpByAgeSeries}
                  />
                </div>
              )) || <p className="govuk-body">Loading graph</p>}
              <p className="govuk-body">Source: {EHCP_SOURCE}</p>
            </>
          }
          table={
            <DataTable
              tableref={numEhcpByAgeTable}
              caption={
                <>
                  Table 6: Number of children and young people aged 14+ who are
                  identified as having a legally binding{' '}
                  <abbr title="Education, Health and Care Plan">EHCP</abbr>{' '}
                  {byAgePeriod} - {comparedLocations}
                </>
              }
              source={EHCP_SOURCE}
              metricColumnName="Age"
              columnHeaders={columnLabels}
              rowHeaders={NUM_EHCP_BY_AGE}
              data={byAgeData}
              showCareProvider={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                tableref={numEhcpByAgeTable}
                filename="number_of_children_and_young_people_with_an_ehcp_by_age.csv"
                xLabel=""
                downloadType="Number of children and young people with an EHCP - by age"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Pupils with SEN support, aged 14 and over"
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/pupils-with-sen-support-aged-14-and-over"
        />
        <DataLinkCard
          label="Percentage of pupils with SEN support, aged 14 and over"
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/percentage-of-pupils-with-sen-support-aged-14-and-over"
        />
        <DataLinkCard
          label={
            <>
              Children and young people with an{' '}
              <abbr title="Education, Health and Care Plan">EHCP</abbr>, aged 14
              and over
            </>
          }
          sources="Department for Education"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/children-and-young-people-with-an-ehcp-aged-14-and-over"
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
