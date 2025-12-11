'use client';

import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import IndicatorTable from '@/components/indicator-components/IndicatorTable';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import { useState, useEffect, useRef, Suspense } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import { authClient } from '@/lib/auth-client';
import SmartInsightsFetchService from '@/services/smart-insights/SmartInsightsFetchService';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { useRouter } from 'next/navigation';
import TableService from '@/services/Table/TableService';
import SmartInsights from '@/components/indicator-components/SmartInsights';
import { Locations } from '@/data/interfaces/Locations';
import Feedback from '@/components/common/feedback/Feedback';
import AnalyticsService from '@/services/analytics/analyticsService';

const TotalBedsPage: React.FC = () => {
  const router = useRouter();

  const [indicatorService, setIndicatorService] =
    useState<IndicatorService | null>(null);

  const { data: session } = authClient.useSession();
  const [smartInsights, setSmartInsights] = useState<string[]>(['']);

  const [locationId, setlocationId] = useState<string>();
  const [locationType, setlocationType] = useState<string>();

  const [locations, setLocations] = useState<Locations[]>();
  const [LaLocationId, setLaLocationId] = useState<string>();

  const [locationName, setlocationName] = useState<string>();
  const [locationRegion, setlocationRegion] = useState<string>();

  const [selectedChartFilters, setSelectedChartFilters] = useState<string[]>();
  const [selectedLineGraphFilters, setSelectedLineGraphFilters] =
    useState<string[]>();

  const [filteredBarChartData, setFilteredBarChartData] = useState<Indicator[]>(
    []
  );
  const [filteredLineGraphData, setFilteredLineGraphData] = useState<
    Indicator[]
  >([]);

  const default_chart_metric_ids = ['bedcount_per_100000_adults_total'];

  const default_line_graph_metric_ids = [
    'bedcount_per_100000_adults_total',
    'bedcount_per_100000_adults_total_dementia_residential',
  ];

  const [chartIndicatorQuery, setChartIndicatorQuery] =
    useState<IndicatorQuery>({
      metric_ids: default_chart_metric_ids,
      location_ids: [],
    });

  const [LineGraphIndicatorQuery, setLineGraphIndicatorQuery] =
    useState<IndicatorQuery>({
      metric_ids: default_line_graph_metric_ids,
      location_ids: [],
    });

  const [smartInsightsIndicatorQuery, setSmartInsightsIndicatorQuery] =
    useState<IndicatorQuery>({
      metric_ids: default_chart_metric_ids,
      location_ids: [],
    });

  useEffect(() => {
    if (
      chartIndicatorQuery &&
      chartIndicatorQuery.location_ids.length > 0 &&
      LineGraphIndicatorQuery &&
      LineGraphIndicatorQuery.location_ids.length > 0 &&
      smartInsightsIndicatorQuery
    ) {
      const fetchData = async () => {
        const chartData: Indicator[] =
          await IndicatorFetchService.getData(chartIndicatorQuery);
        const lineGraphData: Indicator[] = await IndicatorFetchService.getData(
          LineGraphIndicatorQuery
        );
        setFilteredBarChartData(TableService.filterDate(chartData));
        setFilteredLineGraphData(TableService.filterDate(lineGraphData));
        const chartDisplayData: IndicatorDisplay[] =
          await IndicatorFetchService.getDisplayData(chartIndicatorQuery);
        const lineGraphDisplayData: IndicatorDisplay[] =
          await IndicatorFetchService.getDisplayData(LineGraphIndicatorQuery);
        setIndicatorService(
          new IndicatorService(
            chartData,
            lineGraphData,
            chartDisplayData,
            lineGraphDisplayData,
            LineGraphIndicatorQuery.location_ids[0]
          )
        );

        if (session?.user.smartInsights) {
          const insights: string[] = await SmartInsightsFetchService.getData(
            smartInsightsIndicatorQuery
          );
          setSmartInsights(insights);
        }
      };
      fetchData();
    }
  }, [
    chartIndicatorQuery,
    LineGraphIndicatorQuery,
    smartInsightsIndicatorQuery,
  ]);

  useEffect(() => {
    if (session) {
      let locationId = session.user.locationId;
      let locationType = session.user.locationType;
      if (locationType == 'Care provider') {
        locationId = localStorage.getItem('selectedValue')!;
      }
      if (locationId) {
        setlocationId(locationId);
        AnalyticsService.trackMetricLocationView(locationId);
      }
      if (session.user.locationType) {
        setlocationType(session.user.locationType);
      }
    }
  }, [session]);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (locationId && locationType) {
        try {
          let locationids: string[] = [];
          const locations: Locations[] =
            await IndicatorFetchService.getLocalAuthoritiesInProviderLocationRegion(
              locationId
            );
          locationids = locations.map((item: { la_code: any }) => item.la_code);
          setLocations(locations);

          const timeSeriesMetrics = localStorage.getItem('time-series-metrics');
          const barChartMetrics = localStorage.getItem('bar-chart-metric');

          const selectedCode = localStorage.getItem(
            'IndicatorLocationSelectedCode'
          );
          const selectedName = localStorage.getItem(
            'IndicatorLocationSelectedName'
          );
          const selectedRegion = localStorage.getItem(
            'IndicatorLocationSelectedRegion'
          );

          let lineLocationId = locationId;
          if (selectedCode) {
            lineLocationId = selectedCode;
            setlocationName(selectedName!);
            setlocationRegion(selectedRegion!);
          } else {
            const localAuthority =
              await PresentDemandService.getLocations(locationId);
            lineLocationId = localAuthority.la_code;
            setlocationName(localAuthority.la_name);
            setlocationRegion(localAuthority.region_name);
          }
          setLaLocationId(lineLocationId);
          let bCMetrics: string[];
          let bCMetricsNames: string[];

          if (barChartMetrics) {
            let cm: TotalBedsFilters = JSON.parse(barChartMetrics);
            bCMetrics = [cm.metric_id];
            bCMetricsNames = [cm.filter_bedtype];
            setSelectedChartFilters(bCMetricsNames);
          } else {
            bCMetrics = default_chart_metric_ids;
          }

          let lMetrics: string[];
          let lMetricsNames: string[];
          if (timeSeriesMetrics) {
            let tm: [] = JSON.parse(timeSeriesMetrics);
            lMetrics = tm.map((obj) => obj['metric_id']);
            lMetricsNames = tm.map((obj) => obj['filter_bedtype']);
            setSelectedLineGraphFilters(lMetricsNames);
          } else {
            lMetrics = default_line_graph_metric_ids;
          }

          setChartIndicatorQuery({
            metric_ids: bCMetrics,
            location_ids: locationids,
            most_recent: true,
          });

          setLineGraphIndicatorQuery({
            metric_ids: lMetrics,
            location_ids: [lineLocationId],
          });

          setSmartInsightsIndicatorQuery({
            metric_ids: default_chart_metric_ids,
            location_ids: [lineLocationId],
          });
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [locationId, locationType]);

  const barchartSVGContainerRef = useRef<HTMLDivElement>(null);
  const lineGraphSVGContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barchartSVGContainerRef.current && indicatorService) {
      // const containerWidth = barchartSVGContainerRef.current.clientWidth;
      // const containerHeight = barchartSVGContainerRef.current.clientHeight;

      const barchart = indicatorService.createBarchart(locations);
      // containerWidth,
      // containerHeight

      barchartSVGContainerRef.current.innerHTML = '';
      if (barchart) {
        barchartSVGContainerRef.current.appendChild(barchart);
      }
    }

    if (lineGraphSVGContainerRef.current && indicatorService) {
      const lineGraph = indicatorService.createLinegraph(locations);

      lineGraphSVGContainerRef.current.innerHTML = '';
      if (lineGraph) {
        lineGraphSVGContainerRef.current.appendChild(lineGraph);
      }
    }
  }, [indicatorService, barchartSVGContainerRef, lineGraphSVGContainerRef]);

  const getCurrentDataSet = () => {
    if (!indicatorService) return [];
    return indicatorService.getChartData();
  };

  const getCurrentChartDisplayData = () => {
    if (!indicatorService) return null;
    return indicatorService.getChartDisplayData();
  };

  const getCurrentLineGraphDisplayData = () => {
    if (!indicatorService) return null;
    return indicatorService.getLineGraphDisplayData();
  };
  const contentItems = [
    {
      link: '#definition',
      heading: 'Indicator definition and supporting information',
    },
    { link: '#locations', heading: 'Your selected locations' },
    { link: '#data', heading: 'Data' },
    ...(session?.user.smartInsights
      ? [{ link: '#smart-insights', heading: 'Smart insights (experimental)' }]
      : []),
    {
      link: '#feedback',
      heading: 'Give your feedback',
    },
  ];

  return (
    <Suspense>
      <Layout
        title="Adult social care beds per 100,000 adult population"
        showLoginInformation={false}
        currentPage="total-beds"
        showNavBar={false}
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <ContentSidePanel items={contentItems} />
          </div>
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Adult social care beds per 100,000 adult population
            </h1>
            <h2 id="definition" className="govuk-heading-m">
              Indicator definition and supporting information
            </h2>
            <p className="govuk-body">
              The total number of beds recorded by care providers across health
              and adult social care, adjusted to a rate of 100,000 adults in the
              local authority population.
            </p>
            <p className="govuk-body">
              For detailed information about this indicator, including data
              definitions, data source, update schedule and limitations to be
              aware of before using this data, go to &nbsp;
              <a
                href="/help/beds-per-100000-adult-population"
                className="govuk-link"
              >
                supporting information for this data
              </a>
              .
            </p>
            <h2 id="locations" className="govuk-heading-m">
              Your selected locations
            </h2>
            <p className="govuk-body">
              Select locations to view and compare data.
            </p>
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Locations
                  </th>
                  <td className="govuk-table__cell">
                    <ul className="govuk-list" style={{ textAlign: 'left' }}>
                      <li>{locationName}</li>
                      <li>{locationRegion}</li>
                    </ul>
                  </td>
                  <td className="govuk-table__cell">
                    <a href="total-beds/filter-location" className="govuk-link">
                      Change
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <IndicatorTable
              data={getCurrentDataSet()}
              chartDisplay={getCurrentChartDisplayData()}
              lineGraphDisplay={getCurrentLineGraphDisplayData()}
              barchartSVG={barchartSVGContainerRef}
              lineGraphSVG={lineGraphSVGContainerRef}
              selectedChartFilters={selectedChartFilters ?? ['All bed types']}
              selectedLineFilters={
                selectedLineGraphFilters ?? [
                  'All bed types',
                  'Residential - dementia',
                ]
              }
              locationLAId={LaLocationId ?? ''}
              locationName={locationRegion ?? ''}
              filteredBarChartData={filteredBarChartData}
              filteredLineGraphData={filteredLineGraphData}
            />
            {session?.user.smartInsights ? (
              <SmartInsights smartInsights={smartInsights} />
            ) : (
              <></>
            )}

            <div className="govuk-!-margin-top-9">
              <Feedback />
            </div>

            <details className="govuk-details govuk-!-margin-top-9">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Get help with this page
                </span>
              </summary>

              <div className="govuk-details__text">
                <span>If you have any issues using this service, email </span>
                <a
                  href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                  className="govuk-link"
                >
                  getadultsocialcaredata.team@dhsc.gov.uk
                </a>
                .
              </div>
            </details>
          </div>
        </div>
      </Layout>
    </Suspense>
  );
};

export default TotalBedsPage;
