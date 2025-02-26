'use client';

import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
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

const TotalBedsPage: React.FC = () => {
  const [indicatorService, setIndicatorService] =
    useState<IndicatorService | null>(null);

  const { data: session, status} = useSession();

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
    if(indicatorQuery && indicatorQuery.location_ids.length > 0){
      const fetchData = async () => {
        const data: Indicator[] =
          await IndicatorFetchService.getData(indicatorQuery);
        data.forEach((obj) => console.log(obj));
        const displayData: IndicatorDisplay =
          await IndicatorFetchService.getDisplayData('');
        setIndicatorService(new IndicatorService(data, displayData));
      };
      fetchData();
    }
  }, [indicatorQuery]);

  useEffect(() => {
    if(session){
      setlocationId(session.user.locationId);
      setlocationType(session.user.locationType);
    }
  }, [session]);

  useEffect(() => {
    if(locationId && locationType){
      setIndicatorQuery({
        metric_ids: metric_ids,
        location_ids: [locationId]
      });
    }
  }, [locationId,locationType]);

  const barchartSVGContainerRef = useRef<HTMLDivElement>(null);
  const lineGraphSVGContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barchartSVGContainerRef.current && indicatorService) {
      const barchart = indicatorService.createBarchart();

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
  }, [indicatorService]);

  const getCurrentDataSet = () => {
    if (!indicatorService) return [];
    return indicatorService.getChartData();
  };

  const getCurrentDisplayData = () => {
    if (!indicatorService) return [];
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
    <Layout showLoginInformation={false} currentPage="total-beds">
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

          <h2 id="smart-insights" className="govuk-heading-m">
            Smart insights (experimental)
          </h2>
          <div className="govuk-inset-text">
            Smart insights use artificial intelligence (AI) to analyse this
            data, highlighting trends and patterns to support your own analysis.
            As this is experimental, verify the insights to check they are
            appropriate and meet your needs.{' '}
            <a className="govuk-link" href="../0-3/help/smart-insights.html">
              Learn more about smart insights
            </a>
          </div>

          <h3 className="govuk-heading-s">Summary of key trends</h3>
          <p className="govuk-body">
            Suffolk has a higher number of dementia residential beds per 100,000
            adult population (648.8) compared to the East of England region
            (486.6) and England overall (432.8). This suggests a stronger focus
            on residential dementia care in Suffolk than in many other areas.
          </p>

          <p className="govuk-body">
            Additionally, while Suffolk provides more total care beds per
            100,000 people (2,398.4) than the East of England region (1,969.5),
            its provision of dementia nursing beds (160.1 per 100,000) is
            slightly lower than the national average (182.1). This indicates
            that while residential dementia care is well-supported, access to
            specialist nursing care for dementia may be more limited compared to
            the national picture.
          </p>

          <h3 className="govuk-heading-s">
            Insight 1: Strong focus on dementia residential care in Suffolk
          </h3>
          <p className="govuk-body">
            Suffolk has a 33% higher provision of dementia residential beds per
            100,000 people than the East of England region and 50% more than the
            national average. This suggests that dementia residential care is
            more widely available in Suffolk compared to other areas.
          </p>
          <h4 className="govuk-heading-s">How you might use this insight</h4>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Review how demand for dementia residential care compares to other
              types of adult social care to ensure resources align with future
              needs.
            </li>
            <li>
              Assess whether the focus on dementia residential care affects the
              availability of other care types, such as general nursing or
              specialist mental health care.
            </li>
          </ul>

          <h3 className="govuk-heading-s">
            Insight 2: Lower provision of dementia nursing care compared to
            national average
          </h3>
          <p className="govuk-body">
            While Suffolk has a strong provision of dementia residential care,
            its dementia nursing care beds per 100,000 adult population (160.1)
            are lower than the national average (182.1). This may indicate fewer
            options for those needing more intensive nursing support.
          </p>
          <h4 className="govuk-heading-s">How you might use this insight</h4>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              Explore whether demand for dementia nursing care in Suffolk is
              increasing and if additional provision is needed.
            </li>
            <li>
              Consider whether individuals with complex dementia care needs have
              sufficient access to specialised nursing care locally.
            </li>
          </ul>

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
