'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import ContentSidePanel from '../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { Indicator } from '@/data/interfaces/Indicator';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import TableService from '@/services/Table/TableService';
import DataTable from '@/components/tables/table';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';

const PresentDemandPage: React.FC = () => {
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);
  const [filteredBedData, setFilteredBedData] = useState<Indicator[]>([]);
  const [demograpicData, setDemographicData] = useState<Indicator[]>([]);
  const [cpData, setCpData] = useState<Indicator[]>([]);
  const [cpData2, setCpData2] = useState<Indicator[]>([]);
  const [combinedData, setCombinedData] = useState<Indicator[]>([]);
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [bedData, setBedData] = useState<Indicator[]>([]);
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [
      'total_population',
      'perc_18_64',
      'perc_65over',
      'perc_population_disability_disabled_total',
      'dementia_register_65over_per100k',
    ],
    location_ids: ['E10000029', 'E12000006', 'E92000001'],
  });

  const [bedsQuery, setBedsQuery] = useState<IndicatorQuery>({
    metric_ids: ['bedcount_per_100000_adults_total', 'median_occupancy_total'],
    location_ids: ['E10000029', 'E12000006', 'E92000001'],
  });

  const [careProviderDataQuery1, setCareProviderData1Query] =
    useState<IndicatorQuery>({
      metric_ids: ['bedcount_total', 'occupancy_rate_total'],
      location_ids: ['1-10553191017'],
    });

  const [careProviderDataQuery2, setCareProviderData2Query] =
    useState<IndicatorQuery>({
      metric_ids: ['median_bed_count_total', 'median_occupancy_total'],
      location_ids: ['E10000029', 'E12000006', 'E92000001'],
    });

  const demographicColumnHeaders = [
    'Filter',
    'Suffolk',
    'East of England region',
    'All England',
  ];

  const careProvidersColumnHeaders = [
    'Filter',
    'Care Provider A',
    'Suffolk (Median)',
    'East of England region',
    'All England',
  ];

  const demographicRowHeaders = {
    total_population: 'Population',
    perc_18_64: 'Aged 18-65',
    perc_65over: 'Aged 65 and over',
    perc_population_disability_disabled_total: 'Disability rates',
    dementia_register_65over_per100k:
      'Registered dementia patients per 100,000',
  };

  const bedRowHeaders = {
    bedcount_per_100000_adults_total: 'Beds per 100,000 adult population',
    median_occupancy_total: 'Percentage of beds occupied',
  };

  const careProviderRowHeaders = {
    median_bed_count_total: 'Beds in care provider location',
    median_occupancy_total: 'Percentage of beds occupied',
  };

  const careProviderMedianMetrics: Record<string, string> = {
    median_bed_count_total: 'bedcount_total',
    median_occupancy_total: 'occupancy_rate_total',
  };

  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'Care provider A',
    'Suffolk',
    'East of England',
  ]);

  const contentItems = [
    { link: '#summary', heading: 'Introduction' },
    {
      link: '#definition',
      heading: 'Indicator definition and supporting information',
    },
    {
      link: '#capacity-la',
      heading: 'Current capacity - care homes: local authority-level insights',
    },
    {
      link: '#capacity-cp',
      heading: 'Current capacity - care homes: care provider-level insights',
    },
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setDemographicData(filteredDemographicData);
        setFilteredDemographicData(filteredDemographicData);

        const bedData: Indicator[] =
          await IndicatorFetchService.getData(bedsQuery);
        const filteredBedData = TableService.filterDate(bedData);
        setBedData(filteredBedData);
        setFilteredBedData(filteredBedData);

        const CPData: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery1
        );

        const CPData2: Indicator[] = await IndicatorFetchService.getData(
          careProviderDataQuery2
        );

        const comboData: Indicator[] = [...CPData, ...CPData2];
        const filteredCPData = TableService.filterDate(comboData);
        setCombinedData(filteredCPData);
        setFinalCpData(filteredCPData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, []);

  return (
    <Layout
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="present-demand"
      showNavBar={false}
    >
      <a href="#" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <ContentSidePanel items={contentItems} />
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-grid-row govuk-!-margin-bottom-9">
            <h1 className="govuk-heading-l">Current needs and capacity</h1>
            <h2 className="govuk-heading-m" id="summary">
              Introduction
            </h2>
            <p className="govuk-body">
              Understanding current population needs and capacity for adult
              social care services helps identify where needs are being met and
              where gaps may exist.
            </p>
            <p className="govuk-body">
              Here you can explore factors driving local population needs and
              find insights into current capacity to meet those needs.
            </p>
          </div>
          <div className="govuk-grid-row govuk-!-margin-bottom-9">
            <h2 className="govuk-heading-m" id="definition">
              Indicator definition and supporting information
            </h2>
            <p className="govuk-body">
              Find detailed information about each indicator, including data
              definitions, data source, update schedule, and any limitations to
              be aware of before using the data.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <a href="#" className="govuk-link">
                  Population age
                </a>
              </li>
              <li>
                <a href="#" className="govuk-link">
                  Population disability
                </a>
              </li>
              <li>
                <a href="#" className="govuk-link">
                  Adult social care beds per 100,000 adult population
                </a>
              </li>
              <li>
                <a href="#" className="govuk-link">
                  Percentage of adult social care beds occupied
                </a>
              </li>
              <li>
                <a href="#" className="govuk-link">
                  Number of adult social care beds in care provider location
                </a>
              </li>
              <li>
                <a href="#" className="govuk-link">
                  Percentage of adult social care beds occupied in care provider
                  location
                </a>
              </li>
            </ul>
          </div>
          <div className="govuk-grid-row govuk-!-margin-bottom-9">
            <h2 className="govuk-heading-m" id="settings">
              Your selected locations
            </h2>
            <p className="govuk-body">
              Select locations to view and compare data.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row govuk-!-margin-bottom-9">
                <dt className="govuk-summary-list__key">Selected locations</dt>
                <dd className="govuk-summary-list__value">
                  <p>{selectedLocations.join(', ')}</p>
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="#">
                    Change<span className="govuk-visually-hidden"> name</span>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="govuk-grid-row govuk-!-margin-bottom-9">
            <h1 className="govuk-heading-l" id="drivers">
              Drivers of population needs
            </h1>
            <p className="govuk-body">
              Population needs for adult social care are influenced by a range
              of factors, including the population&apos;s age structure,
              disability profile and rate of dementia diagnosis.
            </p>
            <p className="govuk-body">
              Areas with a higher proportion of older adults, people with
              disabilities or rates of dementia diagnosis typically experience
              greater pressure on services.
            </p>
            <ConditionalText
              data={filteredDemographicData}
              ColumnHeaders={demographicColumnHeaders}
              section="Drivers"
              locations={selectedLocations}
              metric_Id="perc_65over"
            ></ConditionalText>
          </div>
          <h3 className="govuk-heading-m govuk-!-margin-bottom-9">
            Explore the data: demographic factors
          </h3>
          <DataTable
            columnHeaders={demographicColumnHeaders}
            rowHeaders={demographicRowHeaders}
            data={filteredDemographicData}
            showCareProvider={false}
          ></DataTable>
          <p className="govuk-body">
            <a href="" className="govuk-link">
              Download table data (CSV)
            </a>
          </p>
          <p className="govuk-body">
            Source: Office for National Statistics, NHS England
            <br />
            Data correct as of X
          </p>

          <div className="govuk-grid-row govuk-!-margin-bottom-9">
            <h2 className="govuk-heading-l" id="capacity-la">
              Current capacity - care homes: local authority-level insights
            </h2>
            <p className="govuk-body">
              The number of adult social care beds per 100,000 adult population
              provides an indicator of current care capacity. A higher number
              suggests more sufficient capacity.
            </p>
            <p className="govuk-body">
              Care homes in {demographicColumnHeaders[1]} have{' '}
              <strong>
                {selectedLocations[1]} has a{' '}
                {filteredBedData.find(
                  (metric) =>
                    metric.metric_id === 'bedcount_per_100000_adults_total' &&
                    metric.location_type === 'LA'
                )?.data_point ?? 'Loading...'}{' '}
                beds per 100,000 adult population
              </strong>
              , compared to the {selectedLocations[2]} average of{' '}
              {filteredBedData.find(
                (metric) =>
                  metric.metric_id === 'bedcount_per_100000_adults_total' &&
                  metric.location_type === 'Regional'
              )?.data_point ?? 'Loading...'}{' '}
              per 100,000.
            </p>
            <ConditionalText
              data={filteredBedData}
              ColumnHeaders={demographicColumnHeaders}
              section="CapacityLA"
              locations={selectedLocations}
              metric_Id="median_occupancy_total"
            ></ConditionalText>
            <h3 className="govuk-heading-m">
              Explore the data: adult social care beds per 100,000 adult
              population and occupancy
            </h3>
            <p className="govuk-body">
              {' '}
              You can filter this data by type of beds
            </p>
            <form action="#">
              <button
                type="submit"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
              >
                Explore data
              </button>
            </form>
            <DataTable
              columnHeaders={demographicColumnHeaders}
              rowHeaders={bedRowHeaders}
              data={bedData}
              showCareProvider={false}
            ></DataTable>
            <p className="govuk-body">
              <a href="" className="govuk-link">
                Download table data (CSV)
              </a>
            </p>
            <p className="govuk-body">
              Source: Office for National Statistics, NHS England
              <br />
              Data correct as of X
            </p>
            <div className="govuk-grid-row govuk-!-margin-bottom-9">
              <h1 className="govuk-heading-l" id="capacity-cp">
                Current capacity - care homes: care provider-level insights
              </h1>
              <p className="govuk-body">
                Examining individual care providers offers insight into how
                their capacity compares with other care providers at local
                authority, regional and national level.
              </p>
              <p className="govuk-body">
                {selectedLocations[0]} is a small provider with (
                {finalCpData.find(
                  (metric) =>
                    metric.metric_id === 'bedcount_total' &&
                    metric.location_type === 'Care provider location'
                )?.data_point ?? 'Loading...'}{' '}
                beds) in {selectedLocations[1]} total beds, compared to the
                median (
                {finalCpData.find(
                  (metric) =>
                    metric.metric_id === 'median_bed_count_total' &&
                    metric.location_type === 'Regional'
                )?.data_point ?? 'Loading...'}{' '}
                beds) in {selectedLocations[1]}.
              </p>
              <ConditionalText
                data={finalCpData}
                ColumnHeaders={careProvidersColumnHeaders}
                section="CapacityCareProvider"
                locations={selectedLocations}
                metric_Id="median_occupancy_total"
              ></ConditionalText>
              <h3 className="govuk-heading-m">
                Explore the data: care providers in
                {demographicColumnHeaders[1]}
              </h3>
              <DataTable
                columnHeaders={careProvidersColumnHeaders}
                rowHeaders={careProviderRowHeaders}
                data={finalCpData}
                showCareProvider={true}
                careProviderMedianMetrics={careProviderMedianMetrics}
              ></DataTable>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PresentDemandPage;
