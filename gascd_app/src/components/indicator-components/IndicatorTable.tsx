import { BarchartData } from '@/data/interfaces/BarchartData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { downloadCSV } from '@/helpers/downloadToCsvHelpers';
import { line } from 'd3';
import React, { RefObject } from 'react';
import MetricTable from '../metric-components/metric-table/MetricTable';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import DownloadTableDataCSVLink from '../metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';

type Props = {
  data: BarchartData[];
  display: IndicatorDisplay | null;
  barchartSVG: RefObject<HTMLDivElement | null>;
  lineGraphSVG: RefObject<HTMLDivElement | null>;
  selectedChartFilters: string[];
  selectedLineFilters: string[];
  locationName: string;
};

const IndicatorTable: React.FC<Props> = ({
  data,
  display,
  barchartSVG,
  lineGraphSVG,
  selectedChartFilters,
  selectedLineFilters,
  locationName,
}) => {

  const handlePNGDownloadClick = () => {
    //todo
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
            This chart shows data for all local authorities in {locationName}.
          </p>
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Filter
                </th>
                <td className="govuk-table__cell">
                  <ul className="moj-side-navigation__list">
                    {selectedChartFilters.map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="/metric/total-beds/filters" className="govuk-link">
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>
            Adult social care beds per 100,000 adult population by local authority
          </h3>
          <div ref={barchartSVG} id="chart-container"></div>
          <br />
          <DownloadTableDataCSVLink
            data={data}
            filename= {display ? display.metric_name : 'Error'}
            xLabel={display ? display.numerator : 'Error'}/>
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

          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Filter
                </th>
                <td className="govuk-table__cell">
                  <ul className="moj-side-navigation__list">
                    {selectedLineFilters.map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="/metric/total-beds/time-series-filter" className="govuk-link">
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div ref={lineGraphSVG} id="line-graph-container"></div>
          <DownloadTableDataCSVLink
              data={data}
              filename= {display ? display.metric_name : 'Error'}
              xLabel={display ? display.numerator : 'Error'}/>
            <p className="govuk-body">
              Source: Capacity Tracker
              <br />
              Data correct as of 24 December 2024
            </p>
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
                    {selectedLineFilters.map((filter, index) => (
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
            headers={['', 'Adult social care beds per 100,000 adult population']}
            tableData={data}
          />
          <p className="govuk-body" />

            <DownloadTableDataCSVLink
              data={data}
              filename= {display ? display.metric_name : 'Error'}
              xLabel={display ? display.numerator : 'Error'}/>

          <p className="govuk-body">Source: Capacity Tracker</p>
          <br />
          Data correct as of 24 December 2024
          <br />
          <a
            // href="../0-3/help/beds-per-100000-people.html"
            href="#" //todo
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
