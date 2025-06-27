import { BarchartData } from '@/data/interfaces/BarchartData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import React, { RefObject, useEffect, useState } from 'react';
import DataTable from '../tables/table';
import DownloadTableDataCSVLink from '../metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { Indicator } from '@/data/interfaces/Indicator';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import TableService from '@/services/Table/TableService';
import IndicatorDisplayService from '@/services/indicator/IndicatorDisplayService';
import Link from 'next/link';

type Props = {
  data: BarchartData[];
  chartDisplay: IndicatorDisplay[] | null;
  lineGraphDisplay: IndicatorDisplay[] | null;
  barchartSVG: RefObject<HTMLDivElement | null>;
  lineGraphSVG: RefObject<HTMLDivElement | null>;
  selectedChartFilters: string[];
  selectedLineFilters: string[];
  locationName: string;
  locationLAId: string;
  filteredBarChartData: Indicator[];
  filteredLineGraphData: Indicator[];
};

const IndicatorTable: React.FC<Props> = ({
  data,
  chartDisplay,
  lineGraphDisplay,
  barchartSVG,
  lineGraphSVG,
  selectedChartFilters,
  selectedLineFilters,
  locationName,
  locationLAId,
  filteredBarChartData,
  filteredLineGraphData,
}) => {
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [tableFilteredData, setTableFilteredData] = useState<Indicator[]>([]);
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [rowHeaders, setRowHeaders] = useState<object>();
  const [tableDataLatestDate, setTableDataLatestDate] = useState<
    string | null
  >();
  const [barDataLatestDate, setBarDataLatestDate] = useState<string | null>();
  const [lineDataLatestDate, setLineDataLatestDate] = useState<string | null>();
  const [selectedTableFilters, setSelectedTableFilters] = useState<string[]>();
  const [localAuthority, setLocalAuthority] = useState<string>();
  const [tableDataSource, setTableDataSource] = useState<string>();
  const handlePNGDownloadClick = () => {
    //todo
  };

  const default_table_metric_ids = [
    'bedcount_per_100000_adults_total',
    'bedcount_per_100000_adults_total_dementia_nursing',
    'bedcount_per_100000_adults_total_dementia_residential',
  ];

  const default_filters = [
    'Total Beds',
    'Dementia Nursing',
    'Dementia Residential',
  ];
  const default_rowHeaders = {
    bedcount_per_100000_adults_total: 'Total Beds',
    bedcount_per_100000_adults_total_dementia_nursing: 'Dementia Nursing',
    bedcount_per_100000_adults_total_dementia_residential:
      'Dementia Residential',
  };

  const [dataQuery, setDataQuery] = useState<IndicatorQuery>({
    metric_ids: default_table_metric_ids,
    location_ids: [],
  });

  useEffect(() => {
    if (locationLAId) {
      setLocalAuthority(locationLAId);
    }
  });

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (localAuthority) {
        try {
          const locationNames = await PresentDemandService.getLocationNames(
            localAuthority,
            false,
            false
          );
          const locationIds = await PresentDemandService.getLocationIds(
            localAuthority,
            false,
            false
          );
          setLocationIds(locationIds);
          setLocationNames(locationNames);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [localAuthority]);

  useEffect(() => {
    const storedData = localStorage.getItem('table-metrics');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          const ids = parsedData.map((item) => item.metric_id);
          setDataQuery(() => ({
            metric_ids: ids,
            location_ids: locationIds,
          }));
          const map: any = {};
          parsedData.map((item) => (map[item.metric_id] = item.filter_bedtype));
          setRowHeaders(map);
          if (parsedData) {
            const tMetricNames = parsedData.map((obj) => obj['filter_bedtype']);
            setSelectedTableFilters(tMetricNames);
          } else {
            setSelectedTableFilters(default_table_metric_ids);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setRowHeaders(default_rowHeaders);
      setSelectedTableFilters(default_filters);
      setDataQuery({
        metric_ids: default_table_metric_ids,
        location_ids: locationIds,
      });
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!dataQuery.location_ids || dataQuery.location_ids.length === 0)
        return;
      try {
        const data: Indicator[] =
          await IndicatorFetchService.getData(dataQuery);
        const tableDataSource =
          await PresentDemandService.getDataSource(dataQuery);
        setTableDataSource(tableDataSource);
        const tableFilteredData = TableService.filterDate(data);
        setTableFilteredData(tableFilteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [dataQuery, locationIds]);

  useEffect(() => {
    if (tableFilteredData.length > 0) {
      setTableDataLatestDate(
        PresentDemandService.getMostRecentDate(tableFilteredData)
      );
    }
    if (filteredBarChartData.length > 0) {
      setBarDataLatestDate(
        PresentDemandService.getMostRecentDate(filteredBarChartData)
      );
    }
    if (filteredLineGraphData.length > 0) {
      setLineDataLatestDate(
        PresentDemandService.getMostRecentDate(filteredLineGraphData)
      );
    }
  }, [tableFilteredData, filteredBarChartData, filteredLineGraphData]);

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
                  <a
                    href="/metric/total-beds/filters-bar-chart"
                    className="govuk-link"
                  >
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <h3>
            Adult social care beds per 100,000 adult population by local
            authority
          </h3>
          <div ref={barchartSVG} id="chart-container"></div>
          <br />
          <DownloadTableDataCSVLink
            data={data}
            filename={chartDisplay ? chartDisplay[0].metric_name : 'Error'}
            xLabel={chartDisplay ? chartDisplay[0].numerator : 'Error'}
          />
          <p className="govuk-body">
            Source: {IndicatorDisplayService.getSource(chartDisplay)}
            <br />
            Data correct as of {barDataLatestDate}
            <br />
            <Link
              href="/help/beds-per-100000-adult-population"
              className="govuk-link"
            >
              View supporting information for this data
            </Link>
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
                  <a
                    href="/metric/total-beds/time-series-filter"
                    className="govuk-link"
                  >
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div ref={lineGraphSVG} id="line-graph-container"></div>
          <DownloadTableDataCSVLink
            data={data}
            filename={
              lineGraphDisplay ? lineGraphDisplay[0].metric_name : 'Error'
            }
            xLabel={lineGraphDisplay ? lineGraphDisplay[0].numerator : 'Error'}
          />
          <p className="govuk-body">
            Source: {IndicatorDisplayService.getSource(lineGraphDisplay)}
            <br />
            Data correct as of {lineDataLatestDate}
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
                    {selectedTableFilters?.map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a
                    href="/metric/total-beds/table-filters"
                    className="govuk-link"
                  >
                    Change
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <DataTable
            columnHeaders={locationNames}
            rowHeaders={rowHeaders ?? {}}
            data={tableFilteredData}
            showCareProvider={false}
          />
          <p className="govuk-body" />
          <DownloadTableDataCSVLink
            data={data}
            filename={chartDisplay ? chartDisplay[0].metric_name : 'Error'}
            xLabel={chartDisplay ? chartDisplay[0].numerator : 'Error'}
          />
          <p className="govuk-body">Source: {tableDataSource}</p>
          <br />
          Data correct as of {tableDataLatestDate}
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
