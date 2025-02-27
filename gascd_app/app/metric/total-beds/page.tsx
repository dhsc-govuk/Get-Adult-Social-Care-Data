'use client';

import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import IndicatorTable from '@/components/indicator-components/IndicatorTable';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import { useState, useEffect, useRef } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SmartInsightsFetchService from '@/services/smart-insights/SmartInsightsFetchService';
import { parseMarkdownBlocks } from '@/utils/parseMarkdown';

const TotalBedsPage: React.FC = () => {
  const [indicatorService, setIndicatorService] =
    useState<IndicatorService | null>(null);

  const { data: session, status } = useSession();
  const [smartInsights, setSmartInsights] = useState<string[]>(['']);

  const [locationId, setlocationId] = useState<string>();
  const [locationType, setlocationType] = useState<string>();

  const searchParams = useSearchParams();
  const selectedFilters = searchParams.get('filters');
  const [parsedFilters, setParsedFilters] = useState<TotalBedsFilters[]>([]);

  const metric_ids = [
    'bedcount_per_100000_adults_total',
    'bedcount_per_100000_adults_total_dementia_residential',
  ];

  const [indicatorQuery, setIndicatorQuery] = useState<IndicatorQuery>({
    metric_ids: metric_ids,
    location_ids: [],
  });

  // 'E10000029', 'E12000006', 'E12000005', 'E12000004'

  useEffect(() => {
    if (selectedFilters) {
      try {
        const decoded = decodeURIComponent(selectedFilters);
        const parsed = JSON.parse(decoded);
        const metricIds: string[] = parsed.map(
          (filter: { metric_id: string; filter_bedtype: string }) =>
            filter.metric_id
        );
        setParsedFilters(parsed);
        setIndicatorQuery((prev) => ({
          ...prev,
          metric_ids: metricIds,
        }));
      } catch (error) {
        console.error('Error parsing selected filters:', error);
      }
    }
  }, [selectedFilters]);

  useEffect(() => {
    if (indicatorQuery && indicatorQuery.location_ids.length > 0) {
      const fetchData = async () => {
        const data: Indicator[] =
          await IndicatorFetchService.getData(indicatorQuery);
        data.forEach((obj) => console.log(obj));
        const displayData: IndicatorDisplay =
          await IndicatorFetchService.getDisplayData('');
        setIndicatorService(new IndicatorService(data, displayData));
        const insights: string[] =
          await SmartInsightsFetchService.getData(indicatorQuery);
        setSmartInsights(insights);
      };
      fetchData();
    }
  }, [indicatorQuery]);

  useEffect(() => {
    if (session) {
      setlocationId(session.user.locationId);
      setlocationType(session.user.locationType);
    }
  }, [session]);

  useEffect(() => {
    if (locationId && locationType) {
      setIndicatorQuery({
        metric_ids: metric_ids,
        location_ids: [locationId],
      });
    }
  }, [locationId, locationType]);

  const barchartSVGContainerRef = useRef<HTMLDivElement>(null);
  const lineGraphSVGContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barchartSVGContainerRef.current && indicatorService) {
      const containerWidth = barchartSVGContainerRef.current.clientWidth;
      const containerHeight = barchartSVGContainerRef.current.clientHeight;

      const barchart = indicatorService.createBarchart(
        containerWidth,
        containerHeight
      );

      barchartSVGContainerRef.current.innerHTML = '';
      if (barchart) {
        barchartSVGContainerRef.current.appendChild(barchart);
      }
    }

    if (lineGraphSVGContainerRef.current && indicatorService) {
      const lineGraph = indicatorService.createLinegraph();

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

  const getCurrentDisplayData = () => {
    if (!indicatorService) return null;
    return indicatorService.getDisplayData();
  };
  const contentItems = [
    {
      link: '#definition',
      heading: 'Indicator definition and supporting information',
    },
    { link: '#locations', heading: 'Your selected locations' },
    { link: '#data', heading: 'Data' },
    { link: '#smart-insights', heading: 'Smart insights (experimental)' },
  ];

  return (
    <Layout
      showLoginInformation={false}
      currentPage="total-beds"
      showNavBar={false}
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
              href="../current/help/beds-per-100000-adult-population.html"
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
                    <li>Suffolk</li>
                    <li>East of England</li>
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="present-demand-locations" className="govuk-link">
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <IndicatorTable
            data={getCurrentDataSet()}
            display={getCurrentDisplayData()}
            barchartSVG={barchartSVGContainerRef}
            lineGraphSVG={lineGraphSVGContainerRef}
            selectedFilters={parsedFilters}
          />

          <div>{parseMarkdownBlocks(smartInsights)}</div>

          <p className="govuk-body">
            <a href="javascript:history.back()" className="govuk-link">
              Back
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TotalBedsPage;
