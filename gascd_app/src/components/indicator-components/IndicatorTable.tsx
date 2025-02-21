import { BarchartData } from '@/data/interfaces/BarchartData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { downloadCSV } from '@/helpers/downloadToCsvHelpers';
import { line } from 'd3';
import React, { RefObject } from 'react';
import MetricTable from '../metric-components/metric-table/MetricTable';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';

type Props = {
  data: BarchartData[];
  display: IndicatorDisplay;
  barchartSVG: RefObject<HTMLDivElement>;
  lineGraphSVG: RefObject<HTMLDivElement>;
  selectedFilters: string[];
};

const IndicatorTable: React.FC<Props> = ({
  data,
  display,
  barchartSVG,
  lineGraphSVG,
  selectedFilters,
}) => {
  const handleCSVDownloadClick = () => {
    downloadCSV(data, display.metric_name, display.numerator);
  };

  const handlePNGDownloadClick = () => {
    console.log('to add');
  };

  return (
    <>
      <h2 id="data" className="govuk-heading-m">
        Data
      </h2>
      <div className="govuk-tabs" data-module="govuk-tabs">
        <h2 className="govuk-tabs__title">Contents</h2>
        <ul className="govuk-tabs__list">
          <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
            <a className="govuk-tabs__tab" href="#chart">
              Bar chart
            </a>
          </li>
          <li className="govuk-tabs__list-item">
            <a className="govuk-tabs__tab" href="#time-series">
              Time series
            </a>
          </li>
          <li className="govuk-tabs__list-item">
            <a className="govuk-tabs__tab" href="#map">
              Map
            </a>
          </li>
          <li className="govuk-tabs__list-item">
            <a className="govuk-tabs__tab" href="#table">
              Table
            </a>
          </li>
        </ul>
        <div className="govuk-tabs__panel" id="chart">
          <h2 className="govuk-heading-m">Bar chart</h2>
          <p className="govuk-body">
            This chart shows data for all local authorities in Suffolk.
          </p>
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Filter
                </th>
                <td className="govuk-table__cell">
                  <td className="govuk-table__cell">
                    <ul className="moj-side-navigation__list">
                      {selectedFilters.map((filter, index) => (
                        <li key={index}>{filter}</li>
                      ))}
                    </ul>
                  </td>
                </td>
                <td className="govuk-table__cell">
                  <a href="/metric/total-beds/filters" className="govuk-link">
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div ref={barchartSVG} id="chart-container"></div>
          <a href="" className="govuk-link" onClick={handlePNGDownloadClick}>
            Download chart image (PNG)
          </a>
          <br />
          <a href="" className="govuk-link" onClick={handleCSVDownloadClick}>
            Download table data (CSV)
          </a>
          <p className="govuk-body">
            Source: Capacity Tracker
            <br />
            Data correct as of 24 December 2024
            <br />
            <a
              href="../0-3/help/beds-per-100000-people.html"
              className="govuk-link"
            >
              View supporting information for this data
            </a>
          </p>
        </div>
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id="time-series"
        >
          <h2 className="govuk-heading-m">Time series</h2>
          <div ref={lineGraphSVG} id="line-graph-container"></div>
        </div>

        <div className="govuk-tabs__panel govuk-tabs__panel--hidden" id="map">
          <h2 className="govuk-heading-m">Map</h2>
          <p className="govuk-body">The map view is not yet available.</p>
          <p className="govuk-body">
            We are working to introduce this feature to the service. In the
            meantime, you can explore the data by chart, time series or table.
          </p>
        </div>
        <div className="govuk-tabs__panel govuk-tabs__panel--hidden" id="table">
          <h2 id="total" className="govuk-heading-m">
            Table
          </h2>
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Filters
                </th>
                <td className="govuk-table__cell">
                  <ul className="moj-side-navigation__list">
                    {selectedFilters.map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="/metric/total-beds/filters">Change</a>
                </td>
              </tr>
            </tbody>
          </table>
          <MetricTable
            headers={['', 'Total hours worked that are agency %']}
            tableData={data}
          />
          <p className="govuk-body" />
          <a href="#" className="govuk-link">
            Download table data (CSV)
          </a>
          <p className="govuk-body">Source: Capacity Tracker</p>
          <br />
          Data correct as of 24 December 2024
          <br />
          <a
            href="../0-3/help/beds-per-100000-people.html"
            className="govuk-link"
          >
            View supporting information for this data
          </a>
        </div>
      </div>
    </>
  );
};

export default IndicatorTable;
