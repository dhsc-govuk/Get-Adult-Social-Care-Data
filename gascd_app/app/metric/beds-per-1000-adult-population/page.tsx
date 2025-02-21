'use client';

import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import ContentSidePanel from '../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import DownloadTableDataCSVLink from '../../../src/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import IndicatorService from '@/services/indicator/IndicatorService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

const BedsPer1000AdultPopulationPage: React.FC = () => {
  const [indicatorService, setIndicatorService] =
    useState<IndicatorService | null>(null);

  const [indicatorQuery, setIndicatorQuery] = useState<IndicatorQuery>({
    metric_ids: [
      'bedcount_per_100000_adults_total',
      'bedcount_per_100000_adults_total_dementia_residential'      
    ],
    location_ids: ['E10000029','E12000006'], // TODO, REMOVE currently set to la - set these from SessionData
  });

  useEffect(() => {
    const fetchData = async () => {
      const data: Indicator[] =
        await IndicatorFetchService.getData(indicatorQuery);
      let dataDupe = { ...data[0] };
      dataDupe.metric_date = new Date(Date.UTC(2024, 5, 0));
      dataDupe.data_point = 5;
      data.push(dataDupe);
      
      const displayData: IndicatorDisplay =
        await IndicatorFetchService.getDisplayData('');
      setIndicatorService(new IndicatorService(data, displayData));
    };
    fetchData();
  }, []);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgContainerRef.current && indicatorService) {
      const barchart = indicatorService.createBarchart();

      svgContainerRef.current.innerHTML = '';
      if (barchart) {
        svgContainerRef.current.appendChild(barchart);
      }
    }
  }, [indicatorService]);

  const getCurrentDataSet = () => {
    if (!indicatorService) return [];
    return indicatorService.getChartData();
  };

  return (
    <Layout
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="beds-per-1000-adult-population"
    >
      <a href="#" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <ContentSidePanel />
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-l">
                Adult social care beds per 1,000 adult population
              </h1>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">
                Indicator definition and supporting information
              </h2>
              <p className="govuk-body">
                The total number of beds recorded by care providers across
                health and adult social care, adjusted to a rate of 100,000
                adults in the local authority population.
              </p>
              <p className="govuk-body">
                For detailed information about this indicator, including data
                definitions, data source, update schedule and limitations to be
                aware of being using this data, go to&nbsp;
                <a href="#" className="govuk-link">
                  supporting information for this data
                </a>
                .
              </p>
            </div>
          </div>
          <div className="govuk-grid-row govuk-!-margin-bottom-2">
            <div className="govuk-grid-column-full">
              <p className="govuk-body"></p>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full govuk-!-text-align-center">
              <div ref={svgContainerRef} id="chart-container"></div>
            </div>
          </div>
          <p className='govuk-body'>
            <DownloadTableDataCSVLink
              data={getCurrentDataSet()}
              filename="bedcount_per_100000_adults"
              xLabel={'locationLevel'}
            />
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BedsPer1000AdultPopulationPage;
