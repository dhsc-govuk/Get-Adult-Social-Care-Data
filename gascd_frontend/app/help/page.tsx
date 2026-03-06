'use client';
import React, { useEffect } from 'react';
import Layout from '@/components/common/layout/Layout';
import AnalyticsService from '@/services/analytics/analyticsService';

const HelpPage = () => {
  const handleClick = () => {
    AnalyticsService.trackHelpEmailClicked();
  };

  useEffect(() => {
    const sortTables = async () => {
      // Import this at page load time to avoid NextJS SSR errors
      // https://nextjs.org/docs/app/guides/lazy-loading#loading-external-libraries
      const HighchartsBaseChart = await import(
        '@ons/design-system/components/chart/chart'
      );

      [HighchartsBaseChart.default].forEach((Component) => {
        console.log(Component);
        document
          .querySelectorAll(Component.selector())
          .forEach((el) => new Component(el));
      });
    };
    sortTables();
  }, []);

  let chartConfig = {
    chart: {
      type: 'bar',
    },
    legend: {
      enabled: true,
    },
    yAxis: {
      title: {
        text: 'Percent (%)',
      },
      labels: {},
    },
    xAxis: {
      title: {},
      categories: [
        'All retailing',
        'All retailing excluding Automotive fuel',
        'Food stores',
        'Department stores',
        'Other non-food stores',
        'Textile clothing u0026 footwear stores',
        'Household goods stores',
        'Non-store retailing',
        'Automotive fuel',
      ],
      type: 'linear',
      labels: {},
    },
    series: [
      {
        name: 'Jan-25',
        data: [1.7, 2.1, 5.6, 0, -0.6, -2.7, -1.7, 2.4, -1.2],
        marker: {
          enabled: false,
        },
        dataLabels: {
          enabled: true,
        },
        connectNulls: false,
        type: 'bar',
      },
    ],
  };

  return (
    <>
      <Layout
        title="Get help with the service"
        showLoginInformation={false}
        currentPage="help"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Get help with this service</h1>
            <p className="govuk-body">
              If you have any questions or need support with this service, email
              us at{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link"
                onClick={handleClick}
              >
                getadultsocialcaredata.team@dhsc.gov.uk
              </a>
              .
            </p>
          </div>
        </div>

        <div
          data-highcharts-base-chart
          data-highcharts-type="bar"
          data-highcharts-theme="primary"
          data-highcharts-title="Food stores showed a strong rise on the month, while non-food stores fell"
          data-highcharts-id="uuid"
        >
          <figure
            className="ons-chart"
            aria-describedby="chart-audio-description-uuid"
          >
            <h2 className="ons-chart__title">
              Food stores showed a strong rise on the month, while non-food
              stores fell
            </h2>
            <h3 className="ons-chart__subtitle">
              Figure 6: Upward contribution from housing and household services
              (including energy) saw the annual CPIH inflation rate rise
            </h3>
            <p className="ons-u-vh" id="chart-audio-description-uuid">
              Volume sales, seasonally adjusted, Great Britain, January 2022 to
              January 2025
            </p>
            <div
              data-highcharts-chart-container
              className="ons-chart__container"
              role="region"
              aria-label="chart container"
              aria-describedby="chart-instructions-uuid"
            >
              <div id="chart-instructions-uuid" className="ons-u-vh">
                Use the Tab key to move focus into the chart. Once inside, use
                the arrow keys to navigate between data points. As you move,
                tooltips will be announced to describe each point. Touch device
                users, explore by touch or with swipe gestures.
              </div>
              <div data-highcharts-chart className="ons-chart__chart"></div>
            </div>
            <figcaption className="ons-chart__caption">
              Source: Monthly Business Survey, Retail Sales Inquiry from the
              Office for National Statistics
            </figcaption>
          </figure>
          <h4 className="ons-chart__download-title">Download Figure 1 data</h4>
          <ol className="ons-list">
            <li className="ons-list__item">
              <a href="#" className="ons-list__link">
                Excel spreadsheet (XLSX format, 18KB)
              </a>
            </li>
            <li className="ons-list__item">
              <a href="#" className="ons-list__link">
                Simple text file (CSV format, 25KB)
              </a>
            </li>
            <li className="ons-list__item">
              <a href="#" className="ons-list__link">
                Image (PNG format, 25KB)
              </a>
            </li>
          </ol>
          <div data-highcharts-config--uuid>{JSON.stringify(chartConfig)}</div>
        </div>
      </Layout>
    </>
  );
};

export default HelpPage;
