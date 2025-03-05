import { BarchartData } from '@/data/interfaces/BarchartData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { downloadCSV } from '@/helpers/downloadToCsvHelpers';
import { line } from 'd3';
import React, { RefObject, useEffect, useState } from 'react';
import MetricTable from '../metric-components/metric-table/MetricTable';
import DataTable from '../tables/table';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import DownloadTableDataCSVLink from '../metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { Indicator } from '@/data/interfaces/Indicator';
import { useSession } from 'next-auth/react';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import TableService from '@/services/Table/TableService';

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
  const { data: session, status } = useSession();
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [locationIdsCP, setLocationIdsCP] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Indicator[]>([]);
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [locationNamesCP, setLocationNamesCP] = useState<string[]>([]);
  const [rowHeaders, setRowHeaders] = useState<object>();
  const [dataLatestDate, setDataLatestDate] = useState<string | null>();
  const [selectedTableFilters, setSelectedTableFilters] = useState<string[]>();
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
    const fetchCareProviderLocationName = async () => {
      const storedLocationId = localStorage.getItem('selectedValue');
      if (storedLocationId) {
        setCPLocationId(storedLocationId);
      } else if (session) {
        if (session.user.locationType == 'Care provider') {
          const locationId = await PresentDemandService.getDefaultCPLocation(
            session.user.locationId ?? ' ',
            session.user.locationType
          );
          setCPLocationId(locationId);
        } else {
          setCPLocationId(session.user.locationId);
        }
      }
    };
    fetchCareProviderLocationName();
  }, [session]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await PresentDemandService.getLocationNames(
            CPLocationId,
            false
          );
          const locationNamesCP = await PresentDemandService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNames(locationNames);
          setLocationNamesCP(locationNamesCP);
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
          const locationids = await PresentDemandService.getLocationIds(
            CPLocationId,
            false
          );
          const locationIdsCP = await PresentDemandService.getLocationIds(
            CPLocationId,
            true
          );
          setLocationIds(locationids);
          setLocationIdsCP(locationIdsCP);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    if (filteredData.length > 0) {
      setDataLatestDate(PresentDemandService.getMostRecentDate(filteredData));
    }
  }, [filteredData]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const data: Indicator[] =
          await IndicatorFetchService.getData(dataQuery);
        const filteredData = TableService.filterDate(data);
        setFilteredData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [dataQuery]);

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
            filename={display ? display.metric_name : 'Error'}
            xLabel={display ? display.numerator : 'Error'}
          />
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
            filename={display ? display.metric_name : 'Error'}
            xLabel={display ? display.numerator : 'Error'}
          />
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
                    {selectedTableFilters?.map((filter, index) => (
                      <li key={index}>{filter}</li>
                    ))}
                  </ul>
                </td>
                <td className="govuk-table__cell">
                  <a href="/metric/total-beds/table-filters">Change</a>
                </td>
              </tr>
            </tbody>
          </table>
          <DataTable
            columnHeaders={locationNames}
            rowHeaders={rowHeaders ?? {}}
            data={filteredData}
            showCareProvider={false}
          />
          <p className="govuk-body" />
          <DownloadTableDataCSVLink
            data={TableService.removeLoadDateTime(filteredData)}
            filename={display ? display.metric_name : 'Error'}
            xLabel={display ? display.numerator : 'Error'}
          />
          <p className="govuk-body">Source: Capacity Tracker</p>
          <br />
          Data correct as of {dataLatestDate}
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
