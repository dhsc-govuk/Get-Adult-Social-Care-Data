import { LocationNames } from '@/data/interfaces/LocationNames';
import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import XYZDataTabs from './XYZDataTabs';
import DataTable from '@/components/tables/table';
import XYZDataBox from './XYZDataBox';
import Link from 'next/link';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import SummaryNHSPeerGroup from '@/components/benchmarking/nhs-peer-summary';
import PeerGroupChartContent from '@/components/charts/peer-group/PeerGroupChartContent';
import XYZDataTabsServer from './XYZDataTabsServer';
import XYZDataTable, { TableColumnValue } from './XYZDataTable';

const breadcrumbs = [
  {
    text: 'Home',
    url: '/home',
  },
  {
    text: 'Population needs',
    url: '/topics/population-needs/subtopics',
  },
];

const demographicMetricIds = [
  'perc_households_deprivation_deprived',
  'perc_household_ownership',
  'perc_households_one_person',
];

type Props = {
  //   searchParams: Promise<{ cplid: string }>;
};
export default async function XYZPage(props: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }
  console.log('///---', { xyz: user, isXYZ: isUserRegistered(user) });

  const data = await get_location_data({ user });

  const { locationNames, locationIds } = await getLocationData(data);

  const laCode = locationIds[1];

  const demographicMetricsDataRequests = await Promise.all(
    demographicMetricIds.map((metricId) =>
      get_la_peers({ user, la_code: laCode, metric_code: metricId }).then(
        (data) =>
          [
            metricId,
            data?.averagePeerGroup ??
              data?.AveragePeerGroup ??
              data?.average_peer_group ??
              null,
          ] as const
      )
    )
  );
  const peerGroupAverages = Object.fromEntries(demographicMetricsDataRequests);

  const demographicData = await get_metric_data({
    metric_ids: demographicMetricIds,
    user,
  });
  const filteredDemographicData = TableService.filterDate(demographicData);

  // Transform Regional data to NHS Peer Group and fetch peer group averages
  const transformedData = filteredDemographicData.map((d) => {
    if (
      d.location_type === 'Regional' &&
      peerGroupAverages[d.metric_id] !== undefined
    ) {
      return {
        ...d,
        location_type: 'Regional',
        data_point: peerGroupAverages[d.metric_id],
      };
    }
    return d;
  });

  type MKey = 'LA' | 'Regional' | 'National';

  const [M1, M2, M3] = demographicMetricIds.map((m) =>
    filteredDemographicData
      .filter((entry) => entry.metric_id == m)
      .map((m) => ({
        key: m.location_type,
        value: TableService.formatDataPoint(Number(m.data_point)),
      }))
      .reduce(
        (obj, item) => ((obj[item.key] = item.value), obj),
        {} as Record<MKey, TableColumnValue>
      )
  );

  console.log('@>>>', {
    metrics: {
      filteredDemographicData,
      demographicData,
      transformedData,
      xyz: [M1, M2, M3],
    },
    peer: {
      peerGroupAverages,
    },
    locationNames,
    locationIds,
  });

  return (
    <Layout title="XYZ" breadcrumbs={breadcrumbs}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">X Y Z</h1>
          <p className="govuk-body-l">Data data data</p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">Data XYZ</h2>
        </div>
      </div>

      <XYZDataBox metricKey="perc_households_deprivation_deprived">
        <h3 className="govuk-heading-m">Household deprivation</h3>
        <p className="govuk-body-m">
          In Census 2021, households were classified by 4 dimensions of
          deprivation: education, employment, health and disability, and
          household overcrowding.
        </p>

        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              How the 4 dimensions of deprivation are measured
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              All the following characteristics must apply for a household to be
              classified as &lsquo;deprived in 4 dimensions&rsquo; in Census
              2021 data.
            </p>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>
                No one in the household has at least level 2 education and no
                one aged 16 to 18 years is a full-time student.
              </li>
              <li>
                A household member is unemployed or economically inactive due to
                long-term sickness or disability, and is not a full-time
                student.
              </li>
              <li>
                Any member of the household has general health that is bad or
                very bad, or is identified as disabled.
              </li>
              <li>
                The household&apos;s accommodation is overcrowded, is in a
                shared dwelling, or has no central heating.
              </li>
            </ol>
            <Link className="govuk-link" href="/help/household-deprivation">
              More details on household deprivation data.
            </Link>
          </div>
        </details>

        <SummaryNHSPeerGroup />

        {/* <XYZDataTabs
          id="1"
          table={
            <DataTable
              // tableref={tableref1}
              caption={`Table 1: percentage of households classified as 'deprived in 4 dimensions' – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_households_deprivation_deprived:
                  'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['perc_households_deprivation_deprived']}
              showAverageLabel={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                // tableref={tableref1}
                filename="households_deprived_in_4_dimensions.csv"
                xLabel=""
                downloadType="percentage of households classified as 'deprived in 4 dimensions'"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_deprivation_deprived' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_deprivation_deprived' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
            />

            // <PeerGroupChartContent
            //   laName={locationNames.LALabel}
            //   currentLaValue={
            //     filteredDemographicData.find(
            //       (d) =>
            //         d.metric_id === 'perc_households_deprivation_deprived' &&
            //         d.location_type === 'LA'
            //     )?.data_point ?? null
            //   }
            //   nationalAverageValue={
            //     filteredDemographicData.find(
            //       (d) =>
            //         d.metric_id === 'perc_households_deprivation_deprived' &&
            //         d.location_type === 'National'
            //     )?.data_point ?? null
            //   }
            //   metricDescription="the percentage of households deprived in 4 dimensions"
            //   figureTitle="Percentage of households deprived in 4 dimensions"
            //   figureNumber={1}
            //   // metricDescription={metricDescription}
            //   // figureTitle={figureTitle}
            //   // figureNumber={figureNumber}
            //   peerData={peerData}
            // />
          }
        /> */}

        <XYZDataTabsServer
          source="XYZ Census 2021..."
          items={[
            {
              label: 'Chart',
              id: 'chart-1',
              panel: (
                <PeerGroupBarChart
                  laCode={laCode}
                  laName={locationNames.LALabel}
                  currentLaValue={
                    filteredDemographicData.find(
                      (d) =>
                        d.metric_id ===
                          'perc_households_deprivation_deprived' &&
                        d.location_type === 'LA'
                    )?.data_point ?? null
                  }
                  nationalAverageValue={
                    filteredDemographicData.find(
                      (d) =>
                        d.metric_id ===
                          'perc_households_deprivation_deprived' &&
                        d.location_type === 'National'
                    )?.data_point ?? null
                  }
                />
              ),
            },
            {
              label: 'Table',
              id: 'table-1',
              panel: (
                <XYZDataTable
                  caption={`Table 1: percentage of households classified as 'deprived in 4 dimensions' – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
                  head={[
                    'Indicator',
                    locationNames.LALabel,
                    locationNames.RegionLabel,
                    locationNames.CountryLabel,
                  ].map((v) => ({ text: v }))}
                  rows={[
                    // ['A1', 'B1', 'C1'].map((v) => ({ text: `Week ${v}` })),
                    // ['A2', 'B2', 'C2'].map((v) => ({ text: `Week ${v}` })),
                    // ['A3', 'B3', 'C3'].map((v) => ({ text: `Week ${v}` })),
                    // ['A4', 'B4', 'C4'].map((v) => ({ text: `Week ${v}` })),
                    [
                      'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
                      M1.LA,
                      M1.Regional,
                      M1.National,
                    ].map((v) => ({ text: v })),
                  ]}
                />
              ),
            },
            {
              label: 'Download',
              id: 'download-1',
              panel: (
                <>
                  <h4 className="govuk-heading-s">Download</h4>
                  <DownloadTableDataCSVLink
                    // tableref={tableref1}
                    filename="households_deprived_in_4_dimensions.csv"
                    xLabel=""
                    downloadType="percentage of households classified as 'deprived in 4 dimensions'"
                  />
                </>
              ),
            },
          ]}
        />
      </XYZDataBox>

      <XYZDataBox metricKey="perc_household_ownership">
        <h3 className="govuk-heading-m">
          Households where the property is owned outright
        </h3>
        <>
          <p className="govuk-body-m">
            This is when the property does not have an outstanding mortgage or
            any other type of loan attached to it.
          </p>
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/households-where-property-is-owned-outright'
              )}
              className="govuk-link"
            >
              how data on property ownership is collected
            </a>
          </p>
          <SummaryNHSPeerGroup />
        </>
        <XYZDataTabs
          id="2"
          table={
            <DataTable
              // tableref={tableref2}
              caption={`Table 2: percentage of households where the property is owned outright – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_household_ownership:
                  'Percentage of households where the property is owned outright',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['perc_household_ownership']}
              showAverageLabel={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                // tableref={tableref2}
                filename="property_owned_outright.csv"
                xLabel=""
                downloadType="percentage of households where the property is owned outright"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_household_ownership' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_household_ownership' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              metricCode="perc_household_ownership"
              metricDescription="the percentage of households where the property is owned outright"
              figureTitle="Percentage of households where the property is owned outright"
              figureNumber={2}
            />
          }
        />
      </XYZDataBox>

      <XYZDataBox metricKey="perc_households_one_person">
        <h3 className="govuk-heading-m">
          One-person households where the person is aged 65 or over
        </h3>
        <>
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/one-person-households-where-person-aged-65-or-over'
              )}
              className="govuk-link"
            >
              how the percentage of one-person households where the person is
              aged 65 or over is calculated
            </a>
          </p>
          <SummaryNHSPeerGroup />
        </>
        <XYZDataTabs
          id="3"
          table={
            <DataTable
              // tableref={tableref3}
              caption={`Table 3: percentage of one-person households where the person is aged 65 or over – ${locationNames.LALabel} LA, ${locationNames.RegionLabel} and ${locationNames.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                perc_households_one_person:
                  'Percentage of one-person households where the person is aged 65 or over',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={['perc_households_one_person']}
              showAverageLabel={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
              <DownloadTableDataCSVLink
                // tableref={tableref3}
                filename="one_person_households_over_65.csv"
                xLabel=""
                downloadType="percentage of one-person households where the person is aged 65 or over"
              />
            </>
          }
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_one_person' &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                filteredDemographicData.find(
                  (d) =>
                    d.metric_id === 'perc_households_one_person' &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              metricCode="perc_households_one_person"
              metricDescription="the percentage of one-person households where the person is aged 65 or over"
              figureTitle="Percentage of one-person households where the person is aged 65 or over"
              figureNumber={3}
            />
          }
        />
      </XYZDataBox>

      {/* $$$ */}
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Households &lsquo;deprived in 4 dimensions&rsquo;"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          url="/help/household-deprivation"
        />
        <DataLinkCard
          label="Households where the property is owned outright"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          url="/help/households-where-property-is-owned-outright"
        />
        <DataLinkCard
          label="One-person households where the person is aged 65 or over"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          url="/help/one-person-households-where-person-aged-65-or-over"
        />
      </DataIndicatorDetailsList>

      {/* $$$ */}
      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence"
          description="Data estimates for undiagnosed dementia."
          url="/topics/population-needs/dementia-prevalence/data"
        />
        <DataLinkCard
          label="General health and disability"
          description="Data on disability prevalence, learning disability diagnoses and reasons for accessing care."
          url="/topics/population-needs/disability-prevalence/data"
        />
        <DataLinkCard
          label="Population size and age group percentages"
          description="Population data at LA, regional and national levels for England."
          url="/topics/population-needs/population-age-and-size/data"
        />
      </RelatedDataList>

      {/* $$$ */}
      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        localAuthorityId={laCode}
      />

      <BackToTop />
    </Layout>
  );
}

async function getLocationData(
  data?: Record<string, Partial<string>>
): Promise<{ locationNames: LocationNames | null; locationIds: string[] }> {
  if (!data) {
    return { locationIds: [], locationNames: null };
  }

  const careProvider = false;
  const locationNames: LocationNames = {
    CPLabel:
      careProvider && data.provider_location_name
        ? data.provider_location_name
        : 'N/A',
    LALabel: data.la_name,
    RegionLabel: data.region_name,
    CountryLabel: data.country_name,
  };

  const locationIds = [
    'Indicator',
    data.la_code,
    data.region_code,
    data.country_code,
  ];
  console.log('@@@', { data, locationIds, locationNames });

  if (careProvider) {
    locationIds.splice(1, 0, data.provider_location_id);
  }
  return { locationNames, locationIds };
}

// async function getHouseholdPercentageData(locationIds: string[]) {
// function transformMetricsData(data) {}
