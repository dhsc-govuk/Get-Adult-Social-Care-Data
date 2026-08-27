import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import XYZDataBox, { DataKey, MetricKey } from './XYZDataBox';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import SummaryNHSPeerGroup from '@/components/benchmarking/nhs-peer-summary';
import PeerGroupChartContent from '@/components/charts/peer-group/PeerGroupChartContent';
import XYZDataTabsClient from './XYZDataTabsClient';
import XYZDataTable, { TableColumnValue } from './XYZDataTable';
import { mapPeerGroupResponse } from '@/components/charts/peer-group/MapPeerGroupResponse';
import { UIMetric } from '@/data/interfaces/Indicator';
import { PeerGroupData } from '@/components/charts/peer-group/types';

const breadcrumbs = [
  {
    text: 'Home',
    url: '/home',
  },
  {
    text: 'Care provision',
    url: '/topics/residential-care/subtopics',
  },
];

const METRIC_KEYS: MetricKey[] = ['perc_unpaid_care_provider'];

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

  const collectedPeers = await Promise.all(
    METRIC_KEYS.map((metricKey) =>
      get_la_peers({
        user,
        la_code: dataKeys.LA,
        metric_code: metricKey,
      }).then((data) => mapPeerGroupResponse(data, metricKey))
    )
  );

  const peersGroupedByKey = collectedPeers.reduce(
    (current, v) => ((current[v.metric_id] = v), current),
    {} as Record<string, PeerGroupData>
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

  const [M1, M2, M3] = METRIC_KEYS.map((m) =>
    metrics
      .filter((entry) => entry.metric_id == m)
      // Attach NHS Peer metric
      .concat({
        metric_date: null,
        metric_id: m,
        location_id: dataKeys.Peer,
        location_type: 'Peer',
        data_point: peersGroupedByKey[m].averagePeerGroup,
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
    // M2,
    // M3,
    peersGroupedByKey,
    collectedPeers,
    metrics: {
      data: metrics,
    },
  });

  return (
    <Layout title="Unpaid care" breadcrumbs={breadcrumbs}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Unpaid care</h1>
          <p className="govuk-body-l">
            Statistics on the people who provide unpaid care to family members,
            friends and neighbours.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>

      <XYZDataBox metricKey="perc_unpaid_care_provider">
        <h3 className="govuk-heading-m">
          People aged 5 and over who provide unpaid care
        </h3>
        <p className="govuk-body-m">
          Find out{' '}
          <a
            href={withBasePath(
              '/help/percentage-people-aged-5-and-over-who-provide-unpaid-care'
            )}
            className="govuk-link"
          >
            how unpaid care is measured.
          </a>{' '}
        </p>

        <SummaryNHSPeerGroup />

        <XYZDataTabsClient
          source="Census 2021 from the Office for National Statistics (ONS)"
          items={[
            {
              label: 'Chart',
              id: 'chart-1',
              panel: (
                <PeerGroupChartContent
                  laName={dataLabels.LA}
                  currentLaValue={M1.LA}
                  nationalAverageValue={M1.National}
                  peerData={peersGroupedByKey['perc_unpaid_care_provider']}
                  figure={{
                    description: `This chart compares the ${'percentage of people aged 5 and over who provide unpaid care'} in ${dataLabels.LA} against its NHS
        Peer Group and England.`,
                    title: `Figure 1: Percentage of people aged 5 or over who provide unpaid care - ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`,
                  }}
                />
              ),
            },
            {
              label: 'Table',
              id: 'table-1',
              panel: (
                <XYZDataTable
                  caption={`Table 1: Percentage of people aged 5 and over who provide
                  unpaid care - ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`}
                  head={[
                    'Indicator',
                    // dataLabels?.CP,
                    dataLabels?.LA,
                    dataLabels?.Peer,
                    dataLabels?.National,
                  ].map((v) => ({ text: v }))}
                  rows={[
                    [
                      'Percentage of people aged 5 and over who provide unpaid care',
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
                    filename="percent_unpaid_care.csv"
                    xLabel=""
                    downloadType={`percentage of people aged 5 and over who provide unpaid care`}
                  />
                </>
              ),
            },
          ]}
        />
      </XYZDataBox>

      {/* $$$ */}
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="People aged 5 and over who provide unpaid care"
          sources="Office for National Statistics."
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/percentage-people-aged-5-and-over-who-provide-unpaid-care"
        />
      </DataIndicatorDetailsList>

      {/* $$$ */}
      <RelatedDataList>
        <DataLinkCard
          label="Care home beds and occupancy levels"
          description="Provision and capacity data for care homes, including local, regional and national statistics."
          url="/topics/residential-care/provision-and-occupancy/data"
        />
        <DataLinkCard
          label="Care provider services"
          description="Data on residential care homes and nursing homes by service type."
          url="/topics/residential-care/residential-care-providers/data"
        />
        <DataLinkCard
          label="Number of adults receiving community social care"
          description="Data on the number of people supported through community social care, including trends over time."
          url="/topics/residential-care/number-of-people-receiving-care/data"
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
    country_name,
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

  // console.log('@@@', { data, result });
  return result;
}

function makePercentageString(v: TableColumnValue) {
  return TableService.formatDataPoint(Number(v), {
    isPercentage: true,
  });
}
