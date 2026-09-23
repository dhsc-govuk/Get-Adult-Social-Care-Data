'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User, useSession } from '@/lib/auth-client';
import { withBasePath } from '@/lib/basePath';
import Layout from '@/components/common/layout/Layout';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import RelatedDataList from '@/components/data-components/RelatedDataList';
import DataTable from '@/components/tables/table';
import VerticalLocationTable from '@/components/tables/VerticalLocationTable';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import BarChart from '@/components/charts/BarChart';
import TimeSeriesChart, {
  DataPoint,
  Series,
} from '@/components/charts/TimeSeriesChart';
import FilterRadioGroup from '@/components/filters/FilterRadioGroup';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import TableService from '@/services/Table/TableService';
import IndicatorService from '@/services/indicator/IndicatorService';
import AnalyticsService from '@/services/analytics/analyticsService';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import ComparatorGroupBuilder from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { ALLOWED_CP_USER_TYPES } from '@/constants';

const CARE_HOME_RESIDENTIAL_CATEGORY = 'residential';

const showCPLevelData = (user: User | null | undefined) => {
  return (
    (user &&
      ALLOWED_CP_USER_TYPES.includes(user.locationType || '') &&
      // Case-insensitive: the data API returns categories like 'Residential'
      user.selectedLocationCategory?.toLowerCase() ===
        CARE_HOME_RESIDENTIAL_CATEGORY) ||
    false
  );
};

export default function ProvisionAndOccupancyPage() {
  const { data: session } = useSession();
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);
  const tableref4 = useRef<HTMLTableElement>(null);
  const tableref5 = useRef<HTMLTableElement>(null);

  const [visibleCareProviderMetricIds1, setVisibleCareProviderMetricIds1] =
    useState<string[]>([]);
  const [numbersTableMetricId, setNumbersTableMetricId] = useState<string>(
    'bedcount_per_hundred_thousand_adults_total'
  );
  const [numbersTableFilterName, setNumbersTableFilterName] =
    useState<string>('');
  const [typesChartFilterName, setTypesChartFilterName] = useState<string>('');
  // location variables
  const [locationNamesCP, setLocationNamesCP] = useState<LocationNames>({
    CPLabel: 'Loading...',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationNamesWithAverageLabels, setLocationNamesWithAverageLabels] =
    useState<LocationNames>({
      CPLabel: 'Loading...',
      LALabel: 'Loading...',
      RegionLabel: 'Loading...',
      CountryLabel: 'Loading...',
    } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [lasForRegion, setLasForRegion] = useState<string[]>();
  const [laIdsForRegion, setLaIdsForRegion] = useState<string[]>();

  // full data sets
  const [finalCpData, setFinalCpData] = useState<Indicator[]>([]);
  const [latestBedTypeData, setLatestBedTypeData] = useState<Indicator[]>([]);
  const [bedTypeOverTimeData, setBedTypeOverTimeData] = useState<Indicator[]>(
    []
  );
  const [bedNumbersData, setBedNumbersData] = useState<Indicator[]>([]);

  // Filtered data sets
  const [filteredCareHomeBedNumbersData, setFilteredCareHomeBedNumbersData] =
    useState<Indicator[]>([]);
  const [filteredCareHomeBedTypesData, setFilteredCareHomeBedTypesData] =
    useState<Indicator[]>([]);
  const [filteredGroupedBedTypesData, setFilteredGroupedBedTypesData] =
    useState<Indicator[]>([]);

  // data queries
  const [careProviderDataQuery1, setCareProviderData1Query] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });
  const [careProviderDataQuery2, setCareProviderData2Query] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [careHomeBedNumbersDataQuery, setCareHomeBedNumbersDataQuery] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [careHomeBedTypesDataQuery, setCareHomeBedTypesDataQuery] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const [
    careHomeBedTypesOverTimeDataQuery,
    setCareHomeBedTypesOverTimeDataQuery,
  ] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  // headers for tables and charts
  const bedTypeRowHeadersDefault = {
    bedcount_per_hundred_thousand_adults_total: 'All bed types',
    bedcount_per_hundred_thousand_adults_community_care: 'Community care bed',
    bedcount_per_hundred_thousand_adults_dementia_nursing: 'Dementia nursing',
    bedcount_per_hundred_thousand_adults_dementia_residential:
      'Dementia residential',
    bedcount_per_hundred_thousand_adults_general_nursing: 'General nursing',
    bedcount_per_hundred_thousand_adults_general_residential:
      'General residential',
    bedcount_per_hundred_thousand_adults_learning_disability_nursing:
      'Learning disability nursing',
    bedcount_per_hundred_thousand_adults_learning_disability_residential:
      'Learning disability residential',
    bedcount_per_hundred_thousand_adults_mental_health_nursing:
      'Mental health nursing',
    bedcount_per_hundred_thousand_adults_mental_health_residential:
      'Mental health residential',
    bedcount_per_hundred_thousand_adults_transitional: 'Transitional',
    bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled:
      'Young physically disabled',
  };

  const [bedTypeRowHeaders, setBedTypeRowHeaders] = useState<any>(
    bedTypeRowHeadersDefault
  );

  // "Care home bed types (grouped by bed type)" is a separate metric from
  // "Care home bed types" above it, so it keeps its own filter selection and
  // its own copy of the bed type rows.
  const [groupedBedTypeRowHeaders, setGroupedBedTypeRowHeaders] = useState<any>(
    bedTypeRowHeadersDefault
  );

  // The bed types chart shows one bed type at a time, chosen beside the
  // comparison group rather than in the page filter (which is a multi-select
  // for the table).
  const [bedTypesChartMetricId, setBedTypesChartMetricId] = useState<string>(
    'bedcount_per_hundred_thousand_adults_total'
  );
  const bedTypesChartFilterName =
    bedTypeRowHeadersDefault[
      bedTypesChartMetricId as keyof typeof bedTypeRowHeadersDefault
    ] ?? 'All bed types';

  const bedTypeChartHeaderDefault = {
    metric_id: 'bedcount_per_hundred_thousand_adults_total',
    filter_bedtype: 'All bed types',
  };

  // TODO(GASCD-245): only the 18+ denominator exists today - there are no
  // working age or 65+ bedcount metrics in MetricCodeEnum, so the other two
  // options have no data to show yet. The control is here so the journey can
  // be reviewed; wire each option to its metric when they land.
  const POPULATION_GROUP_OPTIONS = {
    total_adult: 'Total adult population (18+)',
    working_age: 'Working Age Population (18\u201364)',
    sixty_five_plus: '65+ Adult Population',
  };
  const POPULATION_FILTER_KEY = 'numbers-table-population-group';
  const TYPES_POPULATION_FILTER_KEY = 'type-table-population-group';
  const BED_TYPES_POPULATION_FILTER_KEY = 'grouped-type-table-population-group';
  const GROUPED_TYPE_FILTER_KEY = 'grouped-type-table-metrics';

  const [bedNumberRowHeaders, setBedNumberRowHeaders] = useState<Object[]>([]);

  // metric ids
  // Beds per care home is benchmarked against the comparator group: the
  // group's average is added alongside the true regional value.
  const BEDS_PER_CARE_HOME_METRIC = 'median_bed_count_total';
  const OCCUPANCY_METRIC = 'median_occupancy_total';
  // This page resolves locations with careProvider: false, so the ids are
  // ['Indicator', la, region, country] - the local authority is at index 1.
  const laCode = locationIds[1];
  const metricPage = 'provision-and-occupancy';

  const {
    groups,
    selection,
    setSelection,
    saveGroup,
    updateGroup,
    deleteGroup,
  } = useComparatorGroups();
  const [builderState, setBuilderState] = useState<{
    idPrefix: string;
    editingGroupId?: string;
  } | null>(null);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const {
    dataByMetric,
    loading: chartLoading,
    error: chartError,
  } = usePeerGroupData(
    laCode,
    [BEDS_PER_CARE_HOME_METRIC, OCCUPANCY_METRIC, numbersTableMetricId],
    selection,
    groups
  );
  // Both bed types sections benchmark several metrics at once (one per bed
  // type on show, plus whichever type the grouped chart is showing). They
  // share one deduped fetch - the two tables draw from the same twelve bed
  // type metrics - kept separate from the charts above so a change to a bed
  // type filter does not blank them while the new comparator values load.
  const bedTypesComparatorMetricIds = useMemo(
    () =>
      Array.from(
        new Set([
          bedTypesChartMetricId,
          ...Object.keys(bedTypeRowHeaders as Record<string, string>),
          ...Object.keys(groupedBedTypeRowHeaders as Record<string, string>),
        ])
      ),
    [bedTypesChartMetricId, bedTypeRowHeaders, groupedBedTypeRowHeaders]
  );

  const {
    dataByMetric: bedTypesDataByMetric,
    loading: bedTypesChartLoading,
    error: bedTypesChartError,
  } = usePeerGroupData(laCode, bedTypesComparatorMetricIds, selection, groups);

  const { authorities, error: authoritiesError } = useAllLocalAuthorities(
    builderState !== null
  );

  const selectedGroup =
    selection.kind === 'custom'
      ? groups.find((group) => group.id === selection.groupId)
      : undefined;
  const comparatorLabel = selectedGroup ? selectedGroup.name : undefined;
  const comparatorAverageLabel = selectedGroup
    ? `${selectedGroup.name} (average)`
    : NHS_PEER_GROUP_AVERAGE_LABEL;

  const handleComparatorChange = (newSelection: ComparatorSelection) => {
    setSelection(newSelection);
    setBuilderState(null);
    setBuilderError(null);
    AnalyticsService.trackComparatorChange(newSelection.kind, metricPage);
  };

  const handleGroupSave = async (group: {
    name: string;
    laCodes: string[];
  }) => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await updateGroup(builderState.editingGroupId, group);
        AnalyticsService.trackComparatorGroupEdit(group.laCodes.length);
      } else {
        await saveGroup(group);
        AnalyticsService.trackComparatorGroupSave(group.laCodes.length);
        AnalyticsService.trackComparatorChange('custom', metricPage);
      }
      setBuilderState(null);
    } catch (error) {
      // Keep the builder open so nothing the user entered is lost
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'Your comparator group could not be saved. Try again.'
      );
    }
  };

  const handleGroupDelete = async () => {
    setBuilderError(null);
    try {
      if (builderState?.editingGroupId) {
        await deleteGroup(builderState.editingGroupId);
        AnalyticsService.trackComparatorGroupDelete();
      }
      setBuilderState(null);
    } catch (error) {
      setBuilderError(
        error instanceof Error
          ? error.message
          : 'The comparator group could not be deleted. Try again.'
      );
    }
  };

  const handleEditToggle = (idPrefix: string) => {
    if (selection.kind !== 'custom') return;
    setBuilderError(null);
    setBuilderState((current) =>
      current?.idPrefix === idPrefix && current.editingGroupId
        ? null
        : { idPrefix, editingGroupId: selection.groupId }
    );
  };

  // Shared explanatory note shown alongside the comparator, matching the other
  // benchmarked pages
  const nhsPeerGroupDetails = (
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
        developed by NHS digital in 2022/23 to support benchmarking. This is one
        of a number of approaches that aim to group authorities with similar
        socio-economic and geographic factors (e.g. age, ethnicity, education).
        It is important to note that there is limited evidence of which factors
        are the most important drivers of variation in adult social care. As a
        result, these statistical neighbours should be viewed as a helpful
        starting point for benchmarking, rather than a definitive indication of
        which authorities are most alike or measuring relative performance.
      </div>
    </details>
  );

  const medianDefinitionDetails = (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          Definition of a &lsquo;median&rsquo; number
        </span>
      </summary>
      <div className="govuk-details__text">
        <p>
          If you place a set of numbers in order, the middle one of the set is
          the median number.
        </p>
        <p>
          When there are two middle numbers, the median is the average of those
          two numbers.
        </p>
      </div>
    </details>
  );

  const renderComparatorControl = (
    idPrefix: string,
    // An optional control shown to the right of the comparison group, e.g.
    // the bed type the chart is showing
    extraControl?: React.ReactNode
  ) => {
    const builderOpenHere = builderState?.idPrefix === idPrefix;
    const editingGroup = builderOpenHere
      ? groups.find((group) => group.id === builderState?.editingGroupId)
      : undefined;

    return (
      <>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
          <ComparatorGroupSelect
            idPrefix={idPrefix}
            selection={selection}
            groups={groups}
            onChange={handleComparatorChange}
            onCreateNew={() => setBuilderState({ idPrefix })}
            onEdit={() => handleEditToggle(idPrefix)}
            builderMode={
              builderOpenHere ? (editingGroup ? 'edit' : 'create') : null
            }
          />
          {extraControl}
        </div>
        {builderOpenHere && (
          <ComparatorGroupBuilder
            key={editingGroup?.id ?? 'create'}
            idPrefix={idPrefix}
            allAuthorities={authorities}
            authoritiesError={authoritiesError}
            ownLaCode={laCode}
            existingNames={groups
              .filter((group) => group.id !== editingGroup?.id)
              .map((group) => group.name)}
            onSave={handleGroupSave}
            onCancel={() => {
              setBuilderState(null);
              setBuilderError(null);
            }}
            mode={editingGroup ? 'edit' : 'create'}
            initialName={editingGroup?.name}
            initialCodes={editingGroup?.laCodes}
            onDelete={editingGroup ? handleGroupDelete : undefined}
            serverError={builderError ?? undefined}
          />
        )}
      </>
    );
  };

  // The bed numbers table keeps its regional LA rows and gains one row for
  // whichever comparator is selected - the NHS peer group or a custom group.
  const COMPARATOR_ROW_ID = 'comparator-average';

  const benchmarkedBedNumbersData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredCareHomeBedNumbersData,
        [numbersTableMetricId],
        dataByMetric,
        COMPARATOR_ROW_ID
      ),
    [filteredCareHomeBedNumbersData, numbersTableMetricId, dataByMetric]
  );

  // Inserted after the regional average, before the individual authorities
  const bedNumberRowHeadersWithComparator = useMemo(() => {
    const entries = Object.entries(
      bedNumberRowHeaders as unknown as Record<string, string>
    );
    if (entries.length < 2) return bedNumberRowHeaders;
    const [country, region, ...localAuthorities] = entries;
    return Object.fromEntries([
      country,
      region,
      [COMPARATOR_ROW_ID, comparatorAverageLabel],
      ...localAuthorities,
    ]);
  }, [bedNumberRowHeaders, comparatorAverageLabel]);

  // Care home bed types: the comparator group's average is added as an extra
  // column beside the region and country, for every bed type on show.
  const benchmarkedCareHomeBedTypesData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredCareHomeBedTypesData,
        Object.keys(bedTypeRowHeaders as Record<string, string>),
        bedTypesDataByMetric,
        COMPARATOR_ROW_ID
      ),
    [filteredCareHomeBedTypesData, bedTypeRowHeaders, bedTypesDataByMetric]
  );

  const benchmarkedBedTypesData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredGroupedBedTypesData,
        Object.keys(groupedBedTypeRowHeaders as Record<string, string>),
        bedTypesDataByMetric,
        COMPARATOR_ROW_ID
      ),
    [
      filteredGroupedBedTypesData,
      groupedBedTypeRowHeaders,
      bedTypesDataByMetric,
    ]
  );

  const bedTypesChartSelect = (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-!-font-weight-bold"
        htmlFor="bed-types-chart-select"
      >
        Bed type
      </label>
      <select
        id="bed-types-chart-select"
        className="govuk-select"
        value={bedTypesChartMetricId}
        onChange={(event) => setBedTypesChartMetricId(event.target.value)}
        aria-label="Select bed type"
      >
        {Object.entries(bedTypeRowHeadersDefault).map(([metricId, label]) => (
          <option key={metricId} value={metricId}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  const benchmarkedCpData = useMemo(
    () =>
      mergeComparatorAverage(
        finalCpData,
        [BEDS_PER_CARE_HOME_METRIC, OCCUPANCY_METRIC],
        dataByMetric,
        locationIds[2]
      ),
    [finalCpData, dataByMetric, locationIds]
  );

  const careProviderMetricIds1 = ['bedcount_total', 'occupancy_rate_total'];

  useEffect(() => {
    // Set metric ids which are conditional on the user
    if (session?.user) {
      const _visible_ids = showCPLevelData(session?.user)
        ? careProviderMetricIds1
        : careProviderMetricIds1.filter(
            (metricId) => metricId !== 'bedcount_total'
          );
      setVisibleCareProviderMetricIds1(_visible_ids);
      _visible_ids.forEach((metric_id) => {
        AnalyticsService.trackMetricView(metric_id);
      });
    }
  }, [session]);

  const careProviderMetricIds2 = [
    'median_bed_count_total',
    'median_occupancy_total',
  ];
  const careProviderMedianMetrics: Record<string, string> = {
    median_bed_count_total: 'bedcount_total',
    median_occupancy_total: 'occupancy_rate_total',
  };

  const bedTypeMetricIds = [
    'bedcount_per_hundred_thousand_adults_total',
    'bedcount_per_hundred_thousand_adults_community_care',
    'bedcount_per_hundred_thousand_adults_dementia_nursing',
    'bedcount_per_hundred_thousand_adults_dementia_residential',
    'bedcount_per_hundred_thousand_adults_general_nursing',
    'bedcount_per_hundred_thousand_adults_general_residential',
    'bedcount_per_hundred_thousand_adults_learning_disability_nursing',
    'bedcount_per_hundred_thousand_adults_learning_disability_residential',
    'bedcount_per_hundred_thousand_adults_mental_health_nursing',
    'bedcount_per_hundred_thousand_adults_mental_health_residential',
    'bedcount_per_hundred_thousand_adults_transitional',
    'bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled',
  ];

  const bedNumberMetricIds = ['bedcount_per_hundred_thousand_adults_total'];

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

  const trackDefaultMetrics = () => {
    // Track all of the key metrics shown on this page
    // note - does not include filters, which are tracked as separate events
    careProviderMetricIds2.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
    bedNumberMetricIds.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
  };

  const [chartData, setChartData] = useState<{
    categories: string[];
    values: number[];
  }>({ categories: [], values: [] });

  const updateBarChartData = () => {
    if (!filteredCareHomeBedNumbersData.length) {
      return;
    }
    const data = Object.fromEntries(
      Object.entries(bedNumberRowHeaders).map((header: any) => {
        const datapoints = filteredCareHomeBedNumbersData.filter(
          (item) => item.location_id === header[0]
        );
        const value =
          datapoints.length && datapoints[0].data_point !== null
            ? datapoints[0].data_point
            : 0;
        return [header[1], value];
      })
    );

    const sorted = Object.entries(data).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    );
    const region = sorted.filter((location) =>
      [locationNamesWithAverageLabels.RegionLabel].includes(location[0])
    );
    const country = sorted.filter((location) =>
      [locationNamesWithAverageLabels.CountryLabel].includes(location[0])
    );
    const localAuthorities = sorted.filter(
      (location) =>
        ![
          locationNamesWithAverageLabels.CountryLabel,
          locationNamesWithAverageLabels.RegionLabel,
        ].includes(location[0])
    );

    const categories = [...country, ...region, ...localAuthorities].map(
      (location) => location[0]
    );
    const values = [...country, ...region, ...localAuthorities].map(
      (location) => location[1] as number
    );

    setChartData({
      categories: categories,
      values: values,
    });
  };

  useEffect(() => {
    updateBarChartData();
  }, [bedNumberRowHeaders, filteredCareHomeBedNumbersData]);

  // Location effects
  useEffect(() => {
    // Get Selected location from user
    const fetchSelectedLocation = async () => {
      const userLocationId = await LocationService.getSelectedLocation();
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      setCPLocationId(userLocationId);
    };
    fetchSelectedLocation();
    trackDefaultMetrics();
  }, []);

  useEffect(() => {
    // Get the location names for the current location
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNamesCP(locationNamesCP);
          setLocationNamesWithAverageLabels({
            CPLabel: locationNamesCP.CPLabel!,
            LALabel: locationNamesCP.LALabel,
            RegionLabel: `${locationNamesCP.RegionLabel} (regional average)`,
            CountryLabel: `${locationNamesCP.CountryLabel} (national average)`,
          });
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    // Get location IDs for the selected location
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await LocationService.getLocationIds(
            CPLocationId,
            false
          );
          setLocationIds(locationids);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    // Get LA data for the current region
    const fetchLasForRegion = async () => {
      if (locationIds.length) {
        const las = await LocationService.getLasForRegion(locationIds[2]);
        let idArray: string[] = [];

        las.forEach((la: any) => {
          idArray.push(la.la_code);
        });

        setLasForRegion(las);
        setLaIdsForRegion(idArray);

        const map: any = {};
        map[locationIds[3]] = locationNamesWithAverageLabels.CountryLabel;
        map[locationIds[2]] = locationNamesWithAverageLabels.RegionLabel;
        las.map((item: any) => (map[item.la_code] = item.la_name));
        setBedNumberRowHeaders(map);
      }
    };
    fetchLasForRegion();
  }, [locationIds, locationNamesWithAverageLabels]);

  // Data fetching effects
  useEffect(() => {
    // Set up the basic metric queries
    if (CPLocationId && visibleCareProviderMetricIds1.length) {
      setCareProviderData1Query(() => ({
        metric_ids: visibleCareProviderMetricIds1,
        location_ids: [CPLocationId],
      }));
    }
    if (locationIds.length) {
      setCareProviderData2Query(() => ({
        metric_ids: careProviderMetricIds2,
        location_ids: locationIds,
      }));
      setCareHomeBedTypesDataQuery(() => ({
        metric_ids: bedTypeMetricIds,
        location_ids: locationIds,
      }));
      setCareHomeBedTypesOverTimeDataQuery(() => ({
        metric_ids: bedTypeMetricIds,
        location_ids: [locationIds[1]],
        query_type: 'LATimeseriesQuery',
      }));
    }
    if (laIdsForRegion?.length) {
      setCareHomeBedNumbersDataQuery({
        metric_ids: bedTypeMetricIds,
        location_ids: [locationIds[3], locationIds[2], ...laIdsForRegion],
        query_type: 'RegionQuery',
      });
    }
  }, [
    CPLocationId,
    locationIds,
    laIdsForRegion,
    visibleCareProviderMetricIds1,
  ]);

  useEffect(() => {
    // Fetch all metric data based on set queries
    const fetchCareProviderData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (
          careProviderDataQuery1.location_ids.length &&
          careProviderDataQuery2.location_ids.length
        ) {
          const CPData: Indicator[] = await IndicatorFetchService.getData(
            careProviderDataQuery1
          );
          const CPData2: Indicator[] = await IndicatorFetchService.getData(
            careProviderDataQuery2
          );
          const comboData: Indicator[] = [...CPData, ...CPData2];
          const filteredCPData = TableService.filterDate(comboData);
          setFinalCpData(filteredCPData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchCareProviderData();
  }, [careProviderDataQuery1, careProviderDataQuery2]);

  useEffect(() => {
    const careHomeBedTypesData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedTypesDataQuery.location_ids.length) {
          const bedTypeData: Indicator[] = await IndicatorFetchService.getData(
            careHomeBedTypesDataQuery
          );
          const filteredBedTypeData = TableService.filterDate(bedTypeData);
          setLatestBedTypeData(filteredBedTypeData);
          setFilteredCareHomeBedTypesData(filteredBedTypeData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedTypesData();
  }, [careHomeBedTypesDataQuery]);

  useEffect(() => {
    const careHomeBedTypesOverTimeData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedTypesOverTimeDataQuery.location_ids.length) {
          const bedTypeOverTimeData: Indicator[] =
            await IndicatorFetchService.getData(
              careHomeBedTypesOverTimeDataQuery
            );
          setBedTypeOverTimeData(bedTypeOverTimeData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedTypesOverTimeData();
  }, [careHomeBedTypesOverTimeDataQuery]);

  useEffect(() => {
    const careHomeBedNumbersData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (careHomeBedNumbersDataQuery.location_ids.length) {
          const bedNumberData: Indicator[] =
            await IndicatorFetchService.getData(careHomeBedNumbersDataQuery);
          const bedNumbersData = TableService.filterDate(bedNumberData);
          setBedNumbersData(bedNumbersData);
          setFilteredCareHomeBedNumbersData(
            bedNumbersData.filter(
              (item) =>
                'bedcount_per_hundred_thousand_adults_total' === item.metric_id
            )
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    careHomeBedNumbersData();
  }, [careHomeBedNumbersDataQuery]);

  // update data based on filter changes
  useEffect(() => {
    updateTypesTableMetrics();
  }, [latestBedTypeData]);

  // FilterRadioGroup stores one { metric_id, filter_bedtype }; anything else
  // (including a selection left over from when these were checkboxes) falls
  // back to the default.
  const readStoredBedTypeFilter = (key: string) => {
    const fallback = {
      metric_id: 'bedcount_per_hundred_thousand_adults_total',
      filter_bedtype: 'All bed types',
    };
    const storedData = localStorage.getItem(key);
    if (!storedData) return fallback;
    try {
      const parsed = JSON.parse(storedData);
      return parsed && !Array.isArray(parsed) && parsed.metric_id
        ? (parsed as typeof fallback)
        : fallback;
    } catch (error) {
      console.error(error);
      return fallback;
    }
  };

  // Single select: the table shows the one bed type the filter is set to,
  // defaulting to "All bed types".
  const updateTypesTableMetrics = () => {
    const stored = readStoredBedTypeFilter('type-table-metrics');
    setFilteredCareHomeBedTypesData(
      latestBedTypeData.filter((item) => item.metric_id === stored.metric_id)
    );
    setBedTypeRowHeaders({ [stored.metric_id]: stored.filter_bedtype });
  };

  useEffect(() => {
    updateGroupedTypesTableMetrics();
  }, [latestBedTypeData]);

  // Same shape as updateTypesTableMetrics, against the grouped section's own
  // stored selection.
  const updateGroupedTypesTableMetrics = () => {
    const stored = readStoredBedTypeFilter(GROUPED_TYPE_FILTER_KEY);
    setFilteredGroupedBedTypesData(
      latestBedTypeData.filter((item) => item.metric_id === stored.metric_id)
    );
    setGroupedBedTypeRowHeaders({ [stored.metric_id]: stored.filter_bedtype });
  };

  useEffect(() => {
    updateNumbersTableMetrics();
  }, [bedNumbersData]);

  const updateNumbersTableMetrics = () => {
    // Set up filterable metric queries for the numbers table
    const storedData = localStorage.getItem('numbers-table-metrics');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData) {
        const id = parsedData.metric_id;
        const name = parsedData.filter_bedtype;
        setNumbersTableFilterName(name);
        setNumbersTableMetricId(id);
        setFilteredCareHomeBedNumbersData(
          bedNumbersData.filter((item) => id === item.metric_id)
        );
        AnalyticsService.trackMetricView(id);
      }
    } else {
      setNumbersTableFilterName('All bed types');
      setNumbersTableMetricId('bedcount_per_hundred_thousand_adults_total');
      setFilteredCareHomeBedNumbersData(
        bedNumbersData.filter(
          (item) =>
            'bedcount_per_hundred_thousand_adults_total' === item.metric_id
        )
      );
    }
  };

  useEffect(() => {
    updateTypesChartMetrics();
  }, [bedTypeOverTimeData]);

  const [timeData, setTimedata] = useState<Series[]>([]);
  // Generate time series chart data
  const updateTypesChartMetrics = () => {
    if (!bedTypeOverTimeData.length) return;

    const storedData = localStorage.getItem('single-type-chart-metric');
    let header = bedTypeChartHeaderDefault;
    if (storedData) {
      const filter = JSON.parse(storedData);
      header = filter;
      setTypesChartFilterName(header.filter_bedtype);
    } else {
      setTypesChartFilterName('All bed types');
    }
    // Make some time series data based on the bed type row headers
    let series: Series[] = createTimeSeries(header);
    setTimedata(series);
  };

  const createTimeSeries = (header: any) => {
    let series: Series[] = [];

    const metric_id = header.metric_id;
    const name = header.filter_bedtype;
    // Filter to the current metric ID, for the LA only
    const metric_items = bedTypeOverTimeData.filter(
      (item) => item.metric_id === metric_id
    );

    // Turn into the correct time series format
    const values: DataPoint[] = metric_items.map((item) => {
      return {
        date: IndicatorService.parseDate(item).toISOString(),
        value: item.data_point,
      };
    });
    // Sort by date
    values.sort((a, b) => {
      if (a.date > b.date) {
        return 1;
      } else {
        return -1;
      }
    });
    series.push({
      name: name,
      data: values,
    });
    return series;
  };

  return (
    <Layout
      title="Provision and occupancy"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="provision-and-occupancy"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            Care home beds and occupancy levels
          </h1>
          <p className="govuk-body-l">
            Provision and capacity data for care homes, including local,
            regional and national statistics.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Beds per care home"
        dataInfo={
          <p className="govuk-body-m">
            Find out how{' '}
            <a
              href={withBasePath('/help/beds-care-provider-location')}
              className="govuk-link"
            >
              number of adult social care beds in a care provider location
            </a>{' '}
            are calculated.
          </p>
        }
      >
        {medianDefinitionDetails}
        <DataTabs
          id="3"
          sharingMetricIds={[
            ...careProviderMetricIds1,
            ...careProviderMetricIds2,
          ]}
          table={
            <>
              {renderComparatorControl('comparator-table-3')}
              <DataTable
                tableref={tableref3}
                caption={
                  <>
                    Table 3: care home bed numbers –{' '}
                    {session && showCPLevelData(session.user)
                      ? locationNamesCP.CPLabel + ','
                      : ''}{' '}
                    {locationNamesCP.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNamesCP.RegionLabel}{' '}
                    regional average and national average,{' '}
                    {IndicatorService.getMostRecentDate(finalCpData)}
                  </>
                }
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={{
                  ...locationNamesCP,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={{
                  median_bed_count_total: 'Beds per care home',
                }}
                data={benchmarkedCpData}
                showCareProvider={showCPLevelData(session?.user)}
                careProviderMedianMetrics={careProviderMedianMetrics}
                percentageRows={[]}
                showAverageLabel={true}
              ></DataTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="care_home_bed_numbers_and_occupancy.csv"
                xLabel=""
                downloadType="care home bed numbers and occupancy levels"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Care home bed numbers"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href={withBasePath('/help/beds-per-100000-adult-population')}
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population
              is calculated.
            </a>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <FilterRadioGroup
          filterType="numbers-table-metrics"
          filterLabel="Bed type"
          filters={bedTypeRowHeadersDefault}
          secondaryFilterType={POPULATION_FILTER_KEY}
          secondaryFilterLabel="Population"
          secondaryFilterHint="Select a population group to recalculate the rate per 100,000 people."
          secondaryFilters={POPULATION_GROUP_OPTIONS}
          updateMethod={updateNumbersTableMetrics}
        />
        <DataTabs
          id="1"
          sharingMetricIds={bedTypeMetricIds}
          chart={
            <>
              <PeerGroupBarChart
                laCode={laCode}
                laName={locationNamesCP.LALabel}
                currentLaValue={
                  // The table covers every authority in the region, so match
                  // the user's own LA by code rather than taking the first row
                  benchmarkedBedNumbersData.find(
                    (d) =>
                      d.metric_id === numbersTableMetricId &&
                      d.location_id === laCode
                  )?.data_point ?? null
                }
                nationalAverageValue={
                  benchmarkedBedNumbersData.find(
                    (d) =>
                      d.metric_id === numbersTableMetricId &&
                      d.location_type === 'National'
                  )?.data_point ?? null
                }
                regionalAverageValue={
                  benchmarkedBedNumbersData.find(
                    (d) =>
                      d.metric_id === numbersTableMetricId &&
                      d.location_type === 'Regional'
                  )?.data_point ?? null
                }
                regionalAverageLabel={`${locationNamesCP.RegionLabel} (regional average)`}
                peerData={dataByMetric[numbersTableMetricId] ?? null}
                loading={chartLoading}
                error={chartError}
                comparatorControl={renderComparatorControl(
                  'comparator-chart-1'
                )}
                comparatorLabel={comparatorLabel}
                comparatorAverageLabel={comparatorAverageLabel}
                metricDescription={`care home bed numbers per 100,000 adult population (${numbersTableFilterName.toLowerCase()})`}
                figureTitle={`Care home bed numbers per 100,000 adult population (${numbersTableFilterName.toLowerCase()})`}
                figureNumber={1}
                // Names every series, as the table caption does
                comparisonSummary={`${locationNamesCP.LALabel}, ${comparatorAverageLabel}, ${locationNamesCP.RegionLabel} regional average and national average`}
                // Rates per 100,000, not percentages
                valueSuffix=""
                dateLabel={IndicatorService.getMostRecentDate(bedNumbersData)}
                sourceText="Source: Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)"
              />
              <p className="govuk-body">
                Note: small numbers have been suppressed and will appear as zero
              </p>
            </>
          }
          table={
            <>
              {renderComparatorControl('comparator-table-1')}
              <VerticalLocationTable
                tableref={tableref1}
                caption={
                  <>
                    Table 1: care home bed numbers per 100,000 adult population
                    ({numbersTableFilterName.toLowerCase()}) &ndash;{' '}
                    {locationNamesCP.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNamesCP.RegionLabel}{' '}
                    regional average and national average,{' '}
                    {IndicatorService.getMostRecentDate(bedNumbersData)}
                  </>
                }
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
                }
                columnHeaders={[
                  'Area',
                  'Care home beds per 100,000 adult population',
                ]}
                rowHeaders={bedNumberRowHeadersWithComparator}
                data={benchmarkedBedNumbersData}
                userLa={locationNamesCP.LALabel}
                boldLabel={comparatorAverageLabel}
              ></VerticalLocationTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="care_home_bed_numbers.csv"
                xLabel=""
                downloadType="care home bed numbers per 100,000 adult population for regional local authorities"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Care home bed types"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href={withBasePath('/help/beds-per-100000-adult-population')}
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population
            </a>{' '}
            are calculated.
            {nhsPeerGroupDetails}
            {medianDefinitionDetails}
          </>
        }
      >
        <FilterRadioGroup
          filterType="type-table-metrics"
          filterLabel="Bed type"
          filters={bedTypeRowHeadersDefault}
          secondaryFilterType={TYPES_POPULATION_FILTER_KEY}
          secondaryFilterLabel="Population"
          secondaryFilterHint="Select a population group to recalculate the rate per 100,000 people."
          secondaryFilters={POPULATION_GROUP_OPTIONS}
          updateMethod={updateTypesTableMetrics}
        />
        <DataTabs
          id="2"
          sharingMetricIds={bedTypeMetricIds}
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <DataTable
                tableref={tableref2}
                caption={
                  <>
                    Table 2: care home bed numbers per 100,000 adult population
                    &ndash; {locationNamesCP.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNamesCP.RegionLabel}{' '}
                    regional average and national average,{' '}
                    {IndicatorService.getMostRecentDate(latestBedTypeData)}
                  </>
                }
                metricColumnName="Care home bed type"
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
                }
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={bedTypeRowHeaders}
                data={benchmarkedCareHomeBedTypesData}
                showCareProvider={false}
                percentageRows={[]}
              ></DataTable>
            </>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <p className="govuk-body">
                The number of adult social care beds per 100,000 adult
                population provides an indicator of current care capacity. A
                higher number suggests more sufficient capacity.
              </p>
              <p className="govuk-body">
                Care homes in {locationNamesCP.LALabel} have{' '}
                <strong>
                  {latestBedTypeData.find(
                    (metric) =>
                      metric.metric_id ===
                        'bedcount_per_hundred_thousand_adults_total' &&
                      metric.location_type === 'LA'
                  )?.data_point ?? 'Loading...'}{' '}
                  beds per 100,000 adult population
                </strong>
                , compared to the {locationNamesCP.RegionLabel} regional average
                of{' '}
                {latestBedTypeData.find(
                  (metric) =>
                    metric.metric_id ===
                      'bedcount_per_hundred_thousand_adults_total' &&
                    metric.location_type === 'Regional'
                )?.data_point ?? 'Loading...'}{' '}
                per 100,000.
              </p>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="care_home_bed_types.csv"
                xLabel=""
                downloadType="care home bed numbers per 100,000 adult population"
              />
            </>
          }
        />
      </DataBox>
      {/* TODO(GASCD-245): the design groups the twelve bed types into six
          categories (all bed types, older people & dementia, learning
          disability, mental health, young physically disabled, community care
          & transitional). Those grouped metrics do not exist - MetricCodeEnum
          only has the individual nursing/residential splits - so this section
          still lists the individual types. Summing them in the frontend is not
          safe: counts of 1-5 arrive as null, so a partly suppressed group
          would under-report rather than show (*), and the comparator average
          would drift from the LA column by a different amount again. The
          grouped metrics need to be summed upstream, where the unsuppressed
          counts still exist. */}
      <DataBox
        dataTitle="[NEEDS DATA CHANGE FOR THE GROUPED BED TYPES] Care home bed types (grouped by bed type)"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href={withBasePath('/help/beds-per-100000-adult-population')}
              className="govuk-link"
            >
              the number of adult social care beds per 100,000 adult population
            </a>{' '}
            are calculated.
            {nhsPeerGroupDetails}
            {medianDefinitionDetails}
          </>
        }
      >
        <FilterRadioGroup
          filterType={GROUPED_TYPE_FILTER_KEY}
          filterLabel="Bed type"
          filters={bedTypeRowHeadersDefault}
          secondaryFilterType={BED_TYPES_POPULATION_FILTER_KEY}
          secondaryFilterLabel="Population"
          secondaryFilterHint="Select a population group to recalculate the rate per 100,000 people."
          secondaryFilters={POPULATION_GROUP_OPTIONS}
          updateMethod={updateGroupedTypesTableMetrics}
        />
        <DataTabs
          id="5"
          sharingMetricIds={bedTypeMetricIds}
          chart={
            <>
              <PeerGroupBarChart
                laCode={laCode}
                laName={locationNamesCP.LALabel}
                currentLaValue={
                  latestBedTypeData.find(
                    (d) =>
                      d.metric_id === bedTypesChartMetricId &&
                      d.location_type === 'LA'
                  )?.data_point ?? null
                }
                nationalAverageValue={
                  latestBedTypeData.find(
                    (d) =>
                      d.metric_id === bedTypesChartMetricId &&
                      d.location_type === 'National'
                  )?.data_point ?? null
                }
                regionalAverageValue={
                  latestBedTypeData.find(
                    (d) =>
                      d.metric_id === bedTypesChartMetricId &&
                      d.location_type === 'Regional'
                  )?.data_point ?? null
                }
                regionalAverageLabel={`${locationNamesCP.RegionLabel} (regional average)`}
                peerData={bedTypesDataByMetric[bedTypesChartMetricId] ?? null}
                loading={bedTypesChartLoading}
                error={bedTypesChartError}
                // The bed type sits beside the comparison group, as the chart
                // shows one type at a time while the table shows several
                comparatorControl={renderComparatorControl(
                  'comparator-chart-2',
                  bedTypesChartSelect
                )}
                comparatorLabel={comparatorLabel}
                comparatorAverageLabel={comparatorAverageLabel}
                metricDescription={`care home bed numbers per 100,000 adult population (${bedTypesChartFilterName.toLowerCase()})`}
                figureTitle={`Care home bed numbers per 100,000 adult population (${bedTypesChartFilterName.toLowerCase()})`}
                figureNumber={2}
                comparisonSummary={`${locationNamesCP.LALabel}, ${comparatorAverageLabel}, ${locationNamesCP.RegionLabel} regional average and national average`}
                // Rates per 100,000, not percentages
                valueSuffix=""
                dateLabel={IndicatorService.getMostRecentDate(
                  latestBedTypeData
                )}
                sourceText="Source: Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)"
              />
              <p className="govuk-body">
                Note: small numbers have been suppressed and will appear as zero
              </p>
            </>
          }
          table={
            <>
              {renderComparatorControl('comparator-table-4')}
              <DataTable
                tableref={tableref4}
                caption={
                  <>
                    Table 4: care home bed numbers per 100,000 adult population
                    (grouped by bed type) &ndash; {locationNamesCP.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNamesCP.RegionLabel}{' '}
                    regional average and national average,{' '}
                    {IndicatorService.getMostRecentDate(latestBedTypeData)}
                  </>
                }
                metricColumnName="Care home bed type"
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC), population estimates from the Office for National Statistics (ONS)'
                }
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={groupedBedTypeRowHeaders}
                data={benchmarkedBedTypesData}
                showCareProvider={false}
                percentageRows={[]}
              ></DataTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref4}
                filename="care_home_bed_types_grouped.csv"
                xLabel=""
                downloadType="care home bed numbers per 100,000 adult population grouped by bed type"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Care home bed numbers - trends over time"
        dataInfo={
          <p className="govuk-body">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/beds-per-100000-adult-population-over-time'
              )}
              className="govuk-link"
            >
              how the total number of adult social care beds per 100,000 adults
              in the local authority area over time is calculated
            </a>
            .
          </p>
        }
      >
        <FilterRadioGroup
          filterType="single-type-chart-metric"
          filterLabel="Bed type"
          filters={bedTypeRowHeadersDefault}
          updateMethod={updateTypesChartMetrics}
        />
        <DataTabs
          id="4"
          sharingMetricIds={bedTypeMetricIds}
          graph={
            <>
              <h3 className="govuk-heading-s">
                Figure 3: care home bed numbers per 100,000 adult population (
                {typesChartFilterName.toLowerCase()}) –{' '}
                {locationNamesCP.LALabel}{' '}
                <abbr title="local authority">LA</abbr>,{' '}
                {IndicatorService.getEarliestDate(bedTypeOverTimeData)} to{' '}
                {IndicatorService.getMostRecentDate(bedTypeOverTimeData)}
              </h3>
              {(timeData.length > 0 && (
                <div style={{ width: '100%', height: `500px` }}>
                  <TimeSeriesChart series={timeData} />
                </div>
              )) || <p>Loading graph</p>}
              <p className="govuk-body">
                Note: small numbers have been suppressed and will appear as zero
              </p>
              <p className="govuk-body">
                Source: Capacity Tracker from the Department of Health and
                Social Care (DHSC), population estimates from the Office for
                National Statistics (ONS)
              </p>
            </>
          }
        />
      </DataBox>

      <DataBox
        dataTitle="Occupancy levels"
        dataInfo={
          <>
            Find out how{' '}
            <a
              href={withBasePath('/help/percentage-beds-occupied')}
              className="govuk-link"
            >
              occupancy level percentages
            </a>{' '}
            are calculated.
            {nhsPeerGroupDetails}
          </>
        }
      >
        <DataTabs
          id="6"
          sharingMetricIds={['occupancy_rate_total', OCCUPANCY_METRIC]}
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNamesCP.LALabel}
              currentLaValue={
                benchmarkedCpData.find(
                  (d) =>
                    d.metric_id === OCCUPANCY_METRIC && d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                benchmarkedCpData.find(
                  (d) =>
                    d.metric_id === OCCUPANCY_METRIC &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              regionalAverageValue={
                benchmarkedCpData.find(
                  (d) =>
                    d.metric_id === OCCUPANCY_METRIC &&
                    d.location_type === 'Regional'
                )?.data_point ?? null
              }
              regionalAverageLabel={`${locationNamesCP.RegionLabel} (regional average)`}
              peerData={dataByMetric[OCCUPANCY_METRIC] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-3')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription="care home occupancy levels"
              figureTitle="Care home occupancy levels"
              figureNumber={4}
              comparisonSummary={`${locationNamesCP.LALabel}, ${comparatorAverageLabel}, ${locationNamesCP.RegionLabel} regional average and national average`}
              dateLabel={IndicatorService.getMostRecentDate(finalCpData)}
              sourceText="Source: Capacity Tracker from the Department of Health and Social Care (DHSC)"
            />
          }
          table={
            <>
              {renderComparatorControl('comparator-table-5')}
              <DataTable
                tableref={tableref5}
                caption={
                  <>
                    Table 5: care home occupancy levels &ndash;{' '}
                    {session && showCPLevelData(session.user)
                      ? locationNamesCP.CPLabel + ','
                      : ''}{' '}
                    {locationNamesCP.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNamesCP.RegionLabel}{' '}
                    regional average and national average,{' '}
                    {IndicatorService.getMostRecentDate(finalCpData)}
                  </>
                }
                source={
                  'Capacity Tracker from the Department of Health and Social Care (DHSC)'
                }
                columnHeaders={{
                  ...locationNamesCP,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                rowHeaders={{
                  [OCCUPANCY_METRIC]: 'Occupancy level',
                }}
                data={benchmarkedCpData}
                showCareProvider={showCPLevelData(session?.user)}
                careProviderMedianMetrics={careProviderMedianMetrics}
                percentageRows={[OCCUPANCY_METRIC]}
                showAverageLabel={true}
              ></DataTable>
            </>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              {session?.user.selectedLocationCategory?.toLowerCase() ===
                CARE_HOME_RESIDENTIAL_CATEGORY && (
                <ConditionalText
                  data={finalCpData}
                  ColumnHeaders={locationNamesCP}
                  section="CapacityCareProvider"
                  metric_Id={OCCUPANCY_METRIC}
                ></ConditionalText>
              )}
              <ConditionalText
                data={finalCpData}
                ColumnHeaders={locationNamesCP}
                section="CapacityLA"
                metric_Id={OCCUPANCY_METRIC}
              ></ConditionalText>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref5}
                filename="care_home_occupancy_levels.csv"
                xLabel=""
                downloadType="care home occupancy levels"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/beds-per-100000-adult-population"
        />
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population - over time"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/beds-per-100000-adult-population-over-time"
        />
        <DataLinkCard
          label="Occupancy level percentages for adult social care beds"
          sources="Capacity Tracker"
          updateFrequency="Daily updates"
          limitations={true}
          url="/help/percentage-beds-occupied"
        />
      </DataIndicatorDetailsList>

      <RelatedDataList>
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
        <DataLinkCard
          label="Unpaid care"
          description="Statistics on the people who provide unpaid care to family members, friends and neighbours."
          url="/topics/residential-care/unpaid-care/data"
        />
      </RelatedDataList>

      <LocalMarketInformation
        localAuthority={locationNamesCP.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
