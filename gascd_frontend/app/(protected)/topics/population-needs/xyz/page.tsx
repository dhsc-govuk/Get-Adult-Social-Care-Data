import { Indicator } from '@/data/interfaces/Indicator';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { withBasePath } from '@/lib/basePath';
import TableService from '@/services/Table/TableService';
import { getCurrentUser, isUserRegistered } from '@/lib/permissions';
import { get_la_peers, get_location_data, get_metric_data } from '@/data/DAL';
import { redirect } from 'next/navigation';

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
  return <h1 className="govuk-heading-xl">XYZ</h1>;
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
