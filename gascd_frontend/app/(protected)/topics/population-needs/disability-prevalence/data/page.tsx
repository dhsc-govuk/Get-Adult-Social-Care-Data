import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import SummaryNHSPeerGroup from '@/components/benchmarking/nhs-peer-summary';
import PeerGroupChartContent from '@/components/charts/peer-group/PeerGroupChartContent';
import { mapPeerGroupResponse } from '@/components/charts/peer-group/MapPeerGroupResponse';
import { UIMetric } from '@/data/interfaces/Indicator';
import { PeerGroupData } from '@/components/charts/peer-group/types';
import AnalyticsService from '@/services/analytics/analyticsService';
import DataBox, {
  DataKey,
  MetricKey,
} from '../../../residential-care/unpaid-care/data/DataBox';
import DataTable, {
  TableColumnValue,
} from '../../../residential-care/unpaid-care/data/DataTable';
import DataTabs from '../../../residential-care/unpaid-care/data/DataTabs';

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
  'perc_population_disability',
  'learning_disability_prevalence',
  'perc_general_health',
];

type Props = {
  //   searchParams: Promise<{ cplid: string }>;
};
export default async function UnpaidCarePage(props: Props) {
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
        location_id: dataKeys.Peer ?? '',
        location_type: 'Peer',
        data_point: peersGroupedByKey[m].averagePeerGroup,
      } satisfies UIMetric)
      .map((m) => ({
        key: m.location_type,
        value: m.data_point,
      }))
      .reduce(
        (obj, item) => ((obj[item.key as DataKey] = item.value), obj),
        {} as Record<DataKey, TableColumnValue>
      )
  );

  console.log('@>>>', {
    M1,
    M2,
    M3,
    peersGroupedByKey,
    collectedPeers,
    metrics: {
      data: metrics,
    },
  });

  // Track all metrics on this page
  METRIC_KEYS.forEach((metric_id) => {
    AnalyticsService.trackMetricView(metric_id);
  });

  return (
    <Layout title="General health and disability" breadcrumbs={breadcrumbs}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">General health and disability</h1>
          <p className="govuk-body-l">
            Data on disability prevalence, learning disability diagnoses and
            reasons for accessing care.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>

      <DataBox metricKey="learning_disability_prevalence">
        <h3 className="govuk-heading-m">Learning disability prevalence</h3>
        <p className="govuk-body-m">
          Find out how{' '}
          <a
            href={withBasePath('/help/learning-disability-prevalence')}
            className="govuk-link"
          >
            learning disability prevalence is calculated
          </a>
          .
        </p>

        <SummaryNHSPeerGroup />

        <DataTabs
          // sharingMetricIds={demographicMetricIds}
          source="Fingertips public health profiles from the Department of Health and Social Care (DHSC)"
          items={[
            {
              label: 'Chart',
              id: 'chart-2',
              panel: (
                <PeerGroupChartContent
                  laName={dataLabels.LA}
                  currentLaValue={Number(M2.LA)}
                  nationalAverageValue={Number(M2.National)}
                  peerData={peersGroupedByKey['learning_disability_prevalence']}
                  figure={{
                    description: `This chart compares the ${'learning disability prevalence'} in ${dataLabels.LA} against its NHS
            Peer Group and England.`,
                    title: `Figure 2: Learning disability prevalence - ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`,
                  }}
                />
              ),
            },
            {
              label: 'Table',
              id: 'table-2',
              panel: (
                <DataTable
                  description={`This table compares the ${'learning disability prevalence'} in ${dataLabels.LA} against its NHS
        Peer Group and England.`}
                  caption={`Table 2: Learning disability prevalence - ${dataLabels.LA} LA, ${dataLabels.Peer} and ${dataLabels.National}, March 2021`}
                  head={[
                    'Indicator',
                    // dataLabels?.CP,
                    dataLabels?.LA,
                    dataLabels?.Peer,
                    dataLabels?.National,
                  ].map((v) => ({ text: v }))}
                  rows={[
                    [
                      'Learning disability prevalence',
                      ...[M2.LA, M2.Peer, M2.National].map((v) =>
                        makePercentageString(v)
                      ),
                    ].map((v) => ({ text: v })),
                  ]}
                />
              ),
            },
            {
              label: 'Download',
              id: 'download-2',
              panel: (
                <>
                  <h4 className="govuk-heading-s">Download</h4>
                  <DownloadTableDataCSVLink
                    rawdata={[
                      [
                        'Indicator',
                        // dataLabels?.CP,
                        dataLabels?.LA,
                        dataLabels?.Peer,
                        dataLabels?.National,
                      ],
                      [
                        'Learning disability prevalence',
                        M2.LA,
                        M2.Peer,
                        M2.National,
                      ],
                    ]}
                    filename="learning_disability_prevalence.csv"
                    xLabel=""
                    downloadType={`learning disability prevalence`}
                  />
                </>
              ),
            },
          ]}
        />
      </DataBox>

      {/* $$$ */}
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Disability prevalence"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/disability-prevalence"
        />
        <DataLinkCard
          label="Learning disability prevalence"
          sources="Department of Health and Social Care"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/learning-disability-prevalence"
        />
        <DataLinkCard
          label="People who reported bad or very bad health"
          sources="Office for National Statistics"
          updateFrequency="Updated every 10 years"
          limitations={false}
          url="/help/people-who-reported-bad-or-very-bad-health"
        />
        <DataLinkCard
          label="Primary reason for people to access long-term adult social care"
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/primary-reason-for-accessing-long-term-adult-social-care"
        />
      </DataIndicatorDetailsList>

      {/* $$$ */}
      <RelatedDataList>
        <DataLinkCard
          label="Dementia prevalence"
          description="Data on dementia prevalence."
          url="/topics/population-needs/dementia-prevalence/data"
        />
        <DataLinkCard
          label="Economic factors and household composition"
          description="Data on household deprivation, property ownership and older people living alone."
          url="/topics/population-needs/household-composition-and-economic-factors/data"
        />
        <DataLinkCard
          label="Population size and age group percentages"
          description="Population data at LA, regional and national levels for England."
          url="/topics/population-needs/population-age-and-size/data"
        />
      </RelatedDataList>

      {/* $$$ */}
      <LocalMarketInformation
        localAuthority={dataLabels.LA ?? ''}
        localAuthorityId={dataKeys.LA ?? ''}
      />
      <BackToTop />
    </Layout>
  );
}

type LocationData = {
  dataLabels: Record<DataKey, string | null>;
  dataKeys: Record<DataKey, string | null>;
};
function getLocationData(
  data?: Partial<Record<string, string | null>>
): LocationData {
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
      LA: la_code ?? null,
      National: country_code ?? null,
      Regional: region_code ?? null,
      Peer: 'average_peer_group',
      CP: 'Indicator',
    },
    dataLabels: {
      LA: la_name ?? null,
      // National: country_name,
      National: 'England (national average)',
      Regional: region_name ?? null,
      Peer: 'NHS peer group average',
      CP: careProvider
        ? provider_location_name
          ? provider_location_name
          : null
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
