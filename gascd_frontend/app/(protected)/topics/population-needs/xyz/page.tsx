import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import XYZDataTabs from './XYZDataTabs';
import DataTable from '@/components/tables/table';
import XYZDataBox, { DataKey, MetricKey } from './XYZDataBox';
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
import { mapPeerGroupResponse } from '@/components/charts/peer-group/MapPeerGroupResponse';
import { UIMetric } from '@/data/interfaces/Indicator';

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

const METRIC_KEYS: MetricKey[] = [
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
  console.log('///---', { isXYZ: isUserRegistered(user) });

  const data = await get_location_data({ user });

  const { dataKeys, dataLabels } = await getLocationData(data);

  const [P1, P2, P3] = await Promise.all(
    METRIC_KEYS.map((metricKey) =>
      get_la_peers({
        user,
        la_code: dataKeys.LA,
        metric_code: metricKey,
      }).then((data) => mapPeerGroupResponse(data))
    )
  );

  const metrics = await get_metric_data({
    metric_ids: METRIC_KEYS,
    user,
  }).then((data) =>
    TableService.filterDate(data)
      // Extract from the returned data only what's necessary
      .map(
        ({
          data_point,
          location_id,
          location_type,
          metric_date,
          metric_id,
        }): UIMetric => ({
          data_point,
          location_id,
          location_type,
          metric_date,
          metric_id,
        })
      )
  );
  // const metricsGroupedByKey = Object.groupBy(
  //   metrics,
  //   ({ metric_id }) => metric_id
  // );

  // Transform Regional data to NHS Peer Group and fetch peer group averages
  // const transformedData = metrics.map((d) => {
  //   if (
  //     d.location_type === 'Regional' &&
  //     peerGroupAverages[d.metric_id] !== undefined
  //   ) {
  //     return {
  //       ...d,
  //       location_type: 'Regional',
  //       data_point: peerGroupAverages[d.metric_id],
  //     };
  //   }
  //   return d;
  // });

  const [M1, M2, M3] = METRIC_KEYS.map((m) =>
    metrics
      .filter((entry) => entry.metric_id == m)
      // Attach NHS Peer metric
      .concat({
        metric_date: null,
        metric_id: m,
        location_id: dataKeys.Peer,
        location_type: 'Peer',
        data_point: P1.averagePeerGroup,
      } satisfies UIMetric)
      .map((m) => ({
        key: m.location_type,
        value: m.data_point,
      }))
      .reduce(
        (obj, item) => ((obj[item.key] = item.value), obj),
        {} as Record<DataKey, TableColumnValue>
      )
  );

  console.log('@>>>', {
    M1,
    M2,
    M3,
    P1,
    P2,
    P3,
    metrics: {
      data: metrics,
    },
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

        <XYZDataTabsServer
          source="XYZ Census 2021..."
          items={[
            {
              label: 'Chart',
              id: 'chart-1',
              panel: (
                // <PeerGroupBarChart
                //   laCode={dataKeys.LA}
                //   laName={dataLabels.LA}
                //   currentLaValue={M1.LA}
                //   nationalAverageValue={M1.National}
                // />
                <PeerGroupChartContent
                  laName={dataLabels.LA}
                  currentLaValue={M1.LA}
                  nationalAverageValue={M1.National}
                  metricDescription="the percentage of households deprived in 4 dimensions"
                  figureTitle="Percentage of households deprived in 4 dimensions"
                  figureNumber={1}
                  peerData={P1}
                />
              ),
            },
            {
              label: 'Table',
              id: 'table-1',
              panel: (
                <XYZDataTable
                  caption={`Table 1: percentage of households classified as 'deprived in 4 dimensions' – ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`}
                  head={[
                    // 'Indicator',
                    dataLabels?.CP,
                    dataLabels?.LA,
                    dataLabels?.Peer,
                    dataLabels?.National,
                  ].map((v) => ({ text: v }))}
                  rows={[
                    [
                      'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
                      ...[M1.LA, M1.Peer, M1.National].map((v) =>
                        makePercentageString(v)
                      ),
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
              caption={`Table 2: percentage of households where the property is owned outright – ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={[
                dataLabels?.CP,
                dataLabels?.LA,
                dataLabels?.Regional,
                dataLabels?.National,
              ]}
              rowHeaders={{
                perc_household_ownership:
                  'Percentage of households where the property is owned outright',
              }}
              data={metrics}
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
              laCode={dataKeys.LA}
              laName={dataLabels.LA}
              currentLaValue={M2.LA}
              nationalAverageValue={M2.National}
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
              caption={`Table 3: percentage of one-person households where the person is aged 65 or over – ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={[
                dataLabels?.CP,
                dataLabels?.LA,
                dataLabels?.Regional,
                dataLabels?.National,
              ]}
              rowHeaders={{
                perc_households_one_person:
                  'Percentage of one-person households where the person is aged 65 or over',
              }}
              data={metrics}
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
              laCode={dataKeys.LA}
              laName={dataLabels.LA}
              currentLaValue={M3.LA}
              nationalAverageValue={M3.National}
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
        localAuthority={dataLabels.LA}
        localAuthorityId={dataKeys.LA}
      />

      <BackToTop />
    </Layout>
  );
}

type LocationData = {
  dataLabels: Record<DataKey, string>;
  dataKeys: Record<DataKey, string>;
};
function getLocationData(data?: Record<string, Partial<string>>): LocationData {
  if (!data) {
    throw new Error('Cannot proceed with data formatting.');
  }

  // ...
  const {
    la_code,
    region_code,
    country_code,
    la_name,
    region_name,
    // country_name,
    // ...
    // CP
    provider_location_name,
    provider_location_id,
  } = data;

  const careProvider = false;

  const result: LocationData = {
    dataKeys: {
      LA: la_code,
      National: country_code,
      Regional: region_code,
      Peer: 'average_peer_group',
      CP: 'Indicator',
    },
    dataLabels: {
      LA: la_name,
      // National: country_name,
      National: 'England (national average)',
      Regional: region_name,
      Peer: 'NHS peer group average',
      CP:
        careProvider && provider_location_name
          ? provider_location_name
          : careProvider
            ? provider_location_id
            : 'N/A',
    },
  };

  console.log('@@@', { data, result });
  return result;
}

function makePercentageString(v: TableColumnValue) {
  return TableService.formatDataPoint(Number(v), {
    isPercentage: true,
  });
}
