import { Indicator } from '@/data/interfaces/Indicator';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import DataTabs from '@/components/data-components/DataTabs';
import DataTable from '@/components/tables/table';
import DataBox from '@/components/data-components/DataBox';
import Link from 'next/link';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';

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

  //   const { cplid = 'test_cpl1' } = await searchParams;

  //   const cplid = await LocationService.getSelectedLocation();
  const data = await get_location_data({ user });

  const { locationNames, locationIds } = await getLocationData(data);

  const laCode = locationIds[1];

  const demographicMetricsDataRequests = await Promise.all(
    demographicMetricIds.map((metricId) =>
      // fetch(
      //   withBasePath(
      //     `/api/get_la_peers?la_code=${encodeURIComponent(laCode)}&metric_code=${metricId}`
      //   )
      // )
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

  // const demographicData = await getDemographicData({
  //   locations: locationIds,
  //   metrics: demographicMetricIds,
  // });
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

  console.log('@>>>', {
    transformedData,
    locationNames,
    locationIds,
    filteredDemographicData,
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

      <DataBox
        dataTitle="Household deprivation"
        dataInfo={
          <p className="govuk-body-m">
            In Census 2021, households were classified by 4 dimensions of
            deprivation: education, employment, health and disability, and
            household overcrowding.
          </p>
        }
      >
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
        <details className="govuk-details govuk-!-margin-top-3">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Interpreting the NHS Peer Group
            </span>
          </summary>
          <div className="govuk-details__text">
            GASCD currently uses a{' '}
            <a
              className="govuk-link"
              href="https://github.com/NHSDigital/ASC_LA_Peer_Groups"
              target="_blank"
              rel="noopener noreferrer"
            >
              statistical neighbours model
            </a>{' '}
            developed by NHS digital in 2022/23 to support benchmarking. This is
            one of a number of approaches that aim to group authorities with
            similar socio-economic and geographic factors (e.g. age, ethnicity,
            education). It is important to note that there is limited evidence
            of which factors are the most important drivers of variation in
            adult social care. As a result, these statistical neighbours should
            be viewed as a helpful starting point for benchmarking, rather than
            a definitive indication of which authorities are most alike or
            measuring relative performance.
          </div>
        </details>
        <DataTabs
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
          }
        />
      </DataBox>
    </Layout>
  );
}

async function getLocationData(
  data?: Record<string, Partial<string>>
): Promise<{ locationNames: LocationNames | null; locationIds: string[] }> {
  // const response = await fetch('http://localhost:3000/api/get_location_data');

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

async function getDemographicData(params: {
  locations: string[];
  metrics: string[];
  qtype?: string;
}) {
  const payload = {
    metric_ids: params.metrics,
    // We don't send this to the backend anymore - still needs pulling out of the in-page queries
    //location_ids: query.location_ids.filter((item) => item !== 'Indicator'),
    query_type: params.qtype || 'UserQuery',
  };

  const response = await fetch(withBasePath('/api/get_metric_data'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as Indicator[];

  return data;
}
