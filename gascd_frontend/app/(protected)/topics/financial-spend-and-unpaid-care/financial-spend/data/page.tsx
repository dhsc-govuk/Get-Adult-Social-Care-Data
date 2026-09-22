'use client';

import Layout from '@/components/common/layout/Layout';
import { withBasePath } from '@/lib/basePath';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import DataTable from '@/components/tables/table';
import SubCatergoryTable from '@/components/tables/SubCatergoryTable';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import ComparatorGroupBuilder from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { useComparatorGroups } from '@/components/charts/peer-group/useComparatorGroups';
import { usePeerGroupData } from '@/components/charts/peer-group/usePeerGroupData';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import { NHS_PEER_GROUP_AVERAGE_LABEL } from '@/components/charts/peer-group/constants';
import { ComparatorSelection } from '@/components/charts/peer-group/types';
import { mergeComparatorAverage } from '@/components/charts/peer-group/mergeComparatorAverage';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import TableService from '@/services/Table/TableService';
import AnalyticsService from '@/services/analytics/analyticsService';
import LocationService from '@/services/location/locationService';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import IndicatorService from '@/services/indicator/IndicatorService';
import TimeSeriesChart, {
  DataPoint,
  Series,
} from '@/components/charts/TimeSeriesChart';
import FilterSelectGroup from '@/components/filters/FilterSelectGroup';
import { cloneDeep } from 'lodash';

export default function LAFundingPage() {
  const tableref1 = useRef<HTMLTableElement>(null);
  const tableref2 = useRef<HTMLTableElement>(null);
  const tableref3 = useRef<HTMLTableElement>(null);
  const tableref4 = useRef<HTMLTableElement>(null);
  const tableref5 = useRef<HTMLTableElement>(null);

  const [supportTypeFilterName, setSupportTypeFilterName] =
    useState<string>('');
  const [locationNames, setLocationNames] = useState<LocationNames>({
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

  // This page resolves locations with careProvider: false, so the local
  // authority is at index 1 and the region at index 2.
  const laCode = locationIds[1];
  const metricPage = 'financial-spend';

  const {
    groups,
    selection,
    setSelection,
    saveGroup,
    updateGroup,
    deleteGroup,
  } = useComparatorGroups();
  // Which comparator control has its builder panel open, and whether it is
  // editing an existing group (by id) or creating a new one
  const [builderState, setBuilderState] = useState<{
    idPrefix: string;
    editingGroupId?: string;
  } | null>(null);
  const [builderError, setBuilderError] = useState<string | null>(null);
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

  // Shared explanatory note shown alongside the comparator column, matching
  // the other benchmarked pages
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

  const renderComparatorControl = (idPrefix: string) => {
    const builderOpenHere = builderState?.idPrefix === idPrefix;
    const editingGroup = builderOpenHere
      ? groups.find((group) => group.id === builderState?.editingGroupId)
      : undefined;

    return (
      <>
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
        {builderOpenHere && (
          <ComparatorGroupBuilder
            // Remount when switching between create and edit so the form
            // state is reinitialised from the right group
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
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);
  const [rawLaFundingOverTimeData, setRawLaFundingOverTimeData] = useState<
    Indicator[]
  >([]);
  const [laFundingOverTimeDataForTable, setLAFundingOverTimeDataForTable] =
    useState<Indicator[]>([]);

  const [laFundingTableRowHeaders, setLAFundingTableRowHeaders] = useState<{
    [key: string]: string;
  }>({});

  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });

  const [laFundingOverTimeDataQuery, setLAFundingOverTimeDataQuery] =
    useState<IndicatorQuery>({
      metric_ids: [],
      location_ids: [],
    });

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Funding',
      url: '/topics/financial-spend-and-unpaid-care/subtopics',
    },
  ];

  const metricColumnNames = [
    'Duration of care',
    'Care type or funding method',
    'Financial year',
  ];

  const demographicMetricIds = [
    'edpsr_lt_learning_disability_support_all_ages',
    'edpsr_lt_mental_health_support_all_ages',
    'edpsr_lt_physical_support_all_ages',
    'edpsr_lt_sensory_support_all_ages',
    'edpsr_lt_support_with_memory_and_cognition_all_ages',
    'edpsr_lt_total_all_ages',
    'edpsr_st_learning_disability_support_all_ages',
    'edpsr_st_mental_health_support_all_ages',
    'edpsr_st_physical_support_all_ages',
    'edpsr_st_sensory_support_all_ages',
    'edpsr_st_support_with_memory_and_cognition_all_ages',
    'edpsr_st_total_all_ages',
    'edpsr_stlt_total_all_ages',

    'elss_all_types_of_adult_social_care_all_ages',
    'elss_all_types_of_care_home_all_ages',
    'elss_all_types_of_community_social_care_all_ages',
    'elss_community_direct_payments_all_ages',
    'elss_community_home_care_all_ages',
    'elss_community_other_long_term_care_all_ages',
    'elss_community_supported_living_all_ages',
    'elss_nursing_all_ages',
    'elss_residential_all_ages',
    'elss_supported_accommodation_all_ages',
  ];

  // TODO(GASCD-257): the standardised "per 100,000 adult population (18+)"
  // funding metrics do not exist yet - they are absent from MetricCodeEnum and
  // the metrics table, so no environment can serve them. The selection below
  // composes an unstandardised edpsr_ code so the presentation can be
  // reviewed; replace standardisedFundingMetricId when the real codes land.
  const DURATION_OF_CARE_OPTIONS = {
    stlt: 'Long & short-term',
    lt: 'Long-term only',
    st: 'Short-term only',
  };
  const SUPPORT_REASON_OPTIONS = {
    total: 'All types of adult social care',
    learning_disability_support: 'Learning disability support',
    mental_health_support: 'Mental health support',
    physical_support: 'Physical support',
    sensory_support: 'Sensory support',
    support_with_memory_and_cognition: 'Support with memory and cognition',
  };
  // Figure 2: long-term funding broken down by care type or funding method
  const CARE_TYPE_OPTIONS = {
    elss_all_types_of_adult_social_care_all_ages: 'All types of adult social care',
    elss_all_types_of_care_home_all_ages:
      'All types of care home, including residential and nursing',
    elss_nursing_all_ages: 'Nursing',
    elss_residential_all_ages: 'Residential',
    elss_all_types_of_community_social_care_all_ages:
      'All types of community social care',
    elss_community_home_care_all_ages: 'Home care',
    elss_community_supported_living_all_ages: 'Supported living',
    elss_community_direct_payments_all_ages: 'Community direct payments',
    elss_community_other_long_term_care_all_ages: 'Other',
    elss_supported_accommodation_all_ages: 'Supported accommodation',
  };
  const CARE_TYPE_FILTER_KEY = 'standardised-funding-care-type';
  const [chartCareType, setChartCareType] = useState<string>(
    'elss_all_types_of_adult_social_care_all_ages'
  );

  const DURATION_FILTER_KEY = 'standardised-funding-duration';
  const SUPPORT_REASON_FILTER_KEY = 'standardised-funding-support-reason';

  const [chartDuration, setChartDuration] = useState<string>('stlt');
  const [chartSupportReason, setChartSupportReason] =
    useState<string>('total');

  // Only the short-and-long-term total exists; every other combination is
  // broken down by support reason.
  const standardisedFundingMetricId =
    chartDuration === 'stlt'
      ? 'edpsr_stlt_total_all_ages'
      : `edpsr_${chartDuration}_${chartSupportReason}_all_ages`;

  const readStoredFilter = (key: string, fallback: string) => {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
      return JSON.parse(stored)?.metric_id ?? fallback;
    } catch {
      return fallback;
    }
  };

  const updateStandardisedCareTypeFilter = () => {
    setChartCareType(
      readStoredFilter(
        CARE_TYPE_FILTER_KEY,
        'elss_all_types_of_adult_social_care_all_ages'
      )
    );
  };

  const updateStandardisedFundingFilters = () => {
    setChartDuration(readStoredFilter(DURATION_FILTER_KEY, 'stlt'));
    setChartSupportReason(readStoredFilter(SUPPORT_REASON_FILTER_KEY, 'total'));
  };

  // Table 1 (funding by duration of care) is the benchmarked table: the
  // comparator group's average is added alongside the true regional value.
  // Both benchmarked tables: funding by duration of care (edpsr_) and funding
  // for long-term care by support setting (elss_).
  const durationOfCareMetricIds = demographicMetricIds.filter((id) =>
    id.startsWith('edpsr_')
  );
  const supportSettingMetricIds = demographicMetricIds.filter((id) =>
    id.startsWith('elss_')
  );
  const benchmarkedMetricIds = [
    ...durationOfCareMetricIds,
    ...supportSettingMetricIds,
  ];
  const {
    dataByMetric,
    loading: chartLoading,
    error: chartError,
  } = usePeerGroupData(laCode, benchmarkedMetricIds, selection, groups);

  const benchmarkedDemographicData = useMemo(
    () =>
      mergeComparatorAverage(
        filteredDemographicData,
        benchmarkedMetricIds,
        dataByMetric,
        locationIds[2]
      ),
    [filteredDemographicData, dataByMetric, locationIds]
  );


  const supportSettingsForFundingTrendsDefault = {
    metric_id: 'elss_all_types_of_adult_social_care_all_ages',
    filter_bedtype: 'All types of adult social care',
  };

  const supportSettingsForFundingTrends = {
    elss_all_types_of_adult_social_care_all_ages:
      'All types of adult social care',
    elss_all_types_of_care_home_all_ages: 'All types of care home',
    elss_all_types_of_community_social_care_all_ages:
      'All types of community social care',
    elss_community_direct_payments_all_ages: 'Community direct payments',
    elss_community_home_care_all_ages: 'Home care',
    elss_community_other_long_term_care_all_ages: 'Other',
    elss_community_supported_living_all_ages: 'Supported living',
    elss_nursing_all_ages: 'Nursing',
    elss_residential_all_ages: 'Residential',
    elss_supported_accommodation_all_ages: 'Supported accomodation',
  };

  useEffect(() => {
    const fetchSelectedLocation = async () => {
      const userLocationId = await LocationService.getSelectedLocation();
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      setCPLocationId(userLocationId);
    };
    fetchSelectedLocation();

    // Track all metrics on this page
    demographicMetricIds.forEach((metric_id) => {
      AnalyticsService.trackMetricView(metric_id);
    });
  }, []);

  useEffect(() => {
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
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await LocationService.getLocationNames(
            CPLocationId,
            false
          );
          setLocationNames(locationNames);
          setLocationNamesWithAverageLabels({
            CPLabel: locationNames.CPLabel!,
            LALabel: locationNames.LALabel,
            RegionLabel: `${locationNames.RegionLabel} (regional average)`,
            CountryLabel: `${locationNames.CountryLabel} (national average)`,
          });
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setDemographicQuery(() => ({
        metric_ids: demographicMetricIds,
        location_ids: locationIds,
      }));
      setLAFundingOverTimeDataQuery(() => ({
        metric_ids: [
          'elss_all_types_of_care_home_all_ages',
          'elss_all_types_of_adult_social_care_all_ages',
          'elss_all_types_of_community_social_care_all_ages',
          'elss_community_direct_payments_all_ages',
          'elss_community_home_care_all_ages',
          'elss_community_other_long_term_care_all_ages',
          'elss_community_supported_living_all_ages',
          'elss_nursing_all_ages',
          'elss_residential_all_ages',
          'elss_supported_accommodation_all_ages',
        ],
        location_ids: locationIds,
        query_type: 'MultiLocationTimeseriesQuery',
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);

        // This is a short term solution
        filteredDemographicData.forEach((indicator) => {
          if (indicator.data_point !== null) indicator.data_point *= 1000;
        });
        setFilteredDemographicData(filteredDemographicData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery]);

  useEffect(() => {
    const fetchLaFundingOverTimeData = async () => {
      if (!CPLocationId || !locationIds) return;
      try {
        if (laFundingOverTimeDataQuery.location_ids.length) {
          const laFundingOverTimeData: Indicator[] =
            await IndicatorFetchService.getData(laFundingOverTimeDataQuery);

          // This is a short term solution
          laFundingOverTimeData.forEach((indicator) => {
            if (indicator.data_point !== null) indicator.data_point *= 1000;
          });
          setRawLaFundingOverTimeData(laFundingOverTimeData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchLaFundingOverTimeData();
  }, [laFundingOverTimeDataQuery]);

  useEffect(() => {
    if (rawLaFundingOverTimeData.length > 0) {
      createTimeSeriesForTable();
      createTimeSeries();
    }
  }, [rawLaFundingOverTimeData]);

  const updateLAFundingOverTimeFilter = () => {
    createTimeSeriesForTable();
    createTimeSeries();
  };

  const getSupportTypeFilter = () => {
    const storedData = localStorage.getItem('long-term-funding-support-type');
    let dataType = supportSettingsForFundingTrendsDefault;
    if (storedData) {
      dataType = JSON.parse(storedData);
    }
    setSupportTypeFilterName(dataType.filter_bedtype);
    return dataType;
  };

  const createTimeSeriesForTable = () => {
    let metricIds: any[] = [];
    const supportTypeData: Indicator[] = [];
    rawLaFundingOverTimeData.forEach((indicator) => {
      if (indicator.metric_id === getSupportTypeFilter().metric_id) {
        supportTypeData.push(cloneDeep(indicator));
      }
    });

    supportTypeData.map((indicator) => {
      const indicatorDate = indicator.metric_date;
      if (indicatorDate) {
        indicator.metric_id = `${indicator.metric_id}_${indicatorDate}`;
        if (!metricIds.find((m) => m.id === indicator.metric_id)) {
          metricIds.push({
            id: `${indicator.metric_id}`,
            name: `${indicatorDate - 1} to ${indicatorDate}`,
            endDate: indicatorDate,
          });
        }
      }
    });

    setLAFundingOverTimeDataForTable(supportTypeData);
    setLAFundingTableRowHeaders(
      Object.fromEntries(metricIds.map((m) => [m.id, m.name]))
    );
  };

  const [timeSeriesDataForGraph, setTimeSeriesDataForGraph] = useState<
    Series[]
  >([]);

  const createTimeSeries = () => {
    let series: Series[] = [];
    let lineLabels = [
      locationNames.LALabel,
      locationNames.RegionLabel,
      locationNames.CountryLabel,
    ];
    const supportTypeData = rawLaFundingOverTimeData.filter((indicator) => {
      return indicator.metric_id.includes(getSupportTypeFilter().metric_id);
    });
    let locationIDsForLines = [locationIds[1], locationIds[2], locationIds[3]];
    locationIDsForLines.forEach((locationID: string, index: number) => {
      const id = locationID;
      const metric_items = supportTypeData.filter((item) => {
        return item.location_id === id;
      });
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
        name: lineLabels[index],
        data: values,
      });
    });
    setTimeSeriesDataForGraph(series);
  };

  return (
    <Layout
      title="LA funding for adult social care"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">
            <abbr title="Local Authority">LA</abbr> funding for adult social
            care
          </h1>
          <p className="govuk-body-l">
            Data on funding for both short-term and long-term care, also funding
            by individual care type.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> adult social care funding by
            duration of care
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/percentages-financial-spend-long-term-and-short-term-care'
              )}
              className="govuk-link"
            >
              how the financial spend for short-term and long-term care is
              calculated
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="1"
          sharingMetricIds={demographicMetricIds.filter((id) =>
            id.startsWith('edpsr_')
          )}
          table={
            <>
              {renderComparatorControl('comparator-table-1')}
              <SubCatergoryTable
                tableref={tableref1}
              caption={
                <>
                  Table 1: Total <abbr title="Local Authority">LA</abbr>{' '}
                  spending on long and short-term adult social care for all
                  primary support reasons and all age groups –{' '}
                  {locationNames.LALabel}{' '}
                  <abbr title="Local Authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getFinancialYear(
                    filteredDemographicData,
                    1
                  )}
                </>
              }
              source={
                'Adult Social Care Finance Report from the Department of Health and Social Care'
              }
              columnHeaders={{
                ...locationNamesWithAverageLabels,
                ComparatorLabel: comparatorAverageLabel,
              }}
              metricColumnName={metricColumnNames[0]}
              rowHeaders={{
                edpsr_stlt_total_all_ages: 'Both short-term and long-term',
                edpsr_lt_total_all_ages: 'Long-term',
                edpsr_lt_learning_disability_support_all_ages:
                  'Learning disability support',
                edpsr_lt_mental_health_support_all_ages:
                  'Mental health support',
                edpsr_lt_physical_support_all_ages: 'Physical support',
                edpsr_lt_sensory_support_all_ages: 'Sensory support',
                edpsr_lt_support_with_memory_and_cognition_all_ages:
                  'Support with memory and cognition',
                edpsr_st_total_all_ages: 'Short-term',
                edpsr_st_learning_disability_support_all_ages:
                  'Learning disability support',
                edpsr_st_mental_health_support_all_ages:
                  'Mental health support',
                edpsr_st_physical_support_all_ages: 'Physical support',
                edpsr_st_sensory_support_all_ages: 'Sensory support',
                edpsr_st_support_with_memory_and_cognition_all_ages:
                  'Support with memory and cognition',
              }}
              data={benchmarkedDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
              totalsRows={[
                'edpsr_stlt_total_all_ages',
                'edpsr_lt_total_all_ages',
                'edpsr_st_total_all_ages',
              ]}
              ></SubCatergoryTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref1}
                filename="social_care_funding_by_duration.csv"
                xLabel=""
                downloadType="LA spending on short-term and long-term adult social care for all age groups"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle={
          <>
            [REPLACE WITH REAL METRIC]:{' '}
            <abbr title="Local Authority">LA</abbr> adult social care funding by
            duration of care &ndash; standardised per 100,000 adult population
            (18+)
          </>
        }
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/percentages-financial-spend-long-term-and-short-term-care'
                )}
                className="govuk-link"
              >
                how the financial spend for short-term and long-term care is
                calculated
              </a>
              .
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <FilterSelectGroup
          filterType={DURATION_FILTER_KEY}
          filterLabel="Duration of care"
          filters={DURATION_OF_CARE_OPTIONS}
          secondaryFilterType={SUPPORT_REASON_FILTER_KEY}
          secondaryFilterLabel="Support setting"
          secondaryFilters={SUPPORT_REASON_OPTIONS}
          updateMethod={updateStandardisedFundingFilters}
        />
        <DataTabs
          id="4"
          sharingMetricIds={[standardisedFundingMetricId]}
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === standardisedFundingMetricId &&
                    d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === standardisedFundingMetricId &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              regionalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === standardisedFundingMetricId &&
                    d.location_type === 'Regional'
                )?.data_point ?? null
              }
              regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
              peerData={dataByMetric[standardisedFundingMetricId] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-4')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription={`total spending on ${(
                DURATION_OF_CARE_OPTIONS as Record<string, string>
              )[chartDuration].toLowerCase()} adult social care for ${(
                SUPPORT_REASON_OPTIONS as Record<string, string>
              )[chartSupportReason].toLowerCase()}, standardised per 100,000 adult population (18+)`}
              figureTitle={`Total LA spending on ${(
                DURATION_OF_CARE_OPTIONS as Record<string, string>
              )[chartDuration].toLowerCase()} adult social care for ${(
                SUPPORT_REASON_OPTIONS as Record<string, string>
              )[chartSupportReason].toLowerCase()}, standardised per 100,000 adult population (18+)`}
              figureNumber={1}
              dateLabel={IndicatorService.getFinancialYear(
                benchmarkedDemographicData,
                1
              )}
              sourceText="Source: Adult Social Care Finance Report from the Department of Health and Social Care (DHSC) and population estimates from ONS"
            />
          }
          table={
            <>
              {renderComparatorControl('comparator-table-4')}
              <SubCatergoryTable
                tableref={tableref4}
                caption={
                  <>
                    Table 4: total <abbr title="Local Authority">LA</abbr>{' '}
                    spending on adult social care, standardised per 100,000
                    adult population (18+) &ndash; {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNames.RegionLabel}{' '}
                    (regional average) and {locationNames.CountryLabel}{' '}
                    (national average),{' '}
                    {IndicatorService.getFinancialYear(
                      benchmarkedDemographicData,
                      1
                    )}
                  </>
                }
                source="Adult Social Care Finance Report from the Department of Health and Social Care (DHSC) and population estimates from ONS"
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                metricColumnName="Duration of care"
                rowHeaders={{
                  [standardisedFundingMetricId]: `${
                    (DURATION_OF_CARE_OPTIONS as Record<string, string>)[
                      chartDuration
                    ]
                  } - ${
                    (SUPPORT_REASON_OPTIONS as Record<string, string>)[
                      chartSupportReason
                    ]
                  }`,
                }}
                data={benchmarkedDemographicData}
                showCareProvider={false}
                currency={true}
              ></SubCatergoryTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref4}
                filename="la_funding_by_duration_of_care_standardised.csv"
                xLabel=""
                downloadType="total LA spending on adult social care standardised per 100,000 adult population"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> funding for long-term adult
            social care
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/total-financial-spend-long-term-community-adult-social-care'
              )}
              className="govuk-link"
            >
              how the financial spend is calculated by service type
            </a>
            .
          </p>
        }
      >
        <DataTabs
          id="2"
          sharingMetricIds={demographicMetricIds.filter((id) =>
            id.startsWith('elss_')
          )}
          table={
            <>
              {renderComparatorControl('comparator-table-2')}
              <SubCatergoryTable
                tableref={tableref2}
              caption={
                <>
                  Table 2: Total <abbr title="Local Authority">LA</abbr> funding
                  for long-term adult social care by support setting for all age
                  groups – {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getFinancialYear(
                    filteredDemographicData,
                    1
                  )}
                </>
              }
              source={
                'Adult Social Care Finance Report from the Department of Health and Social Care'
              }
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
              metricColumnName={metricColumnNames[1]}
              rowHeaders={{
                elss_all_types_of_adult_social_care_all_ages:
                  'All types of adult social care',
                elss_all_types_of_care_home_all_ages:
                  'All types of care home, including residential and nursing',
                elss_nursing_all_ages: 'Nursing',
                elss_residential_all_ages: 'Residential',
                elss_all_types_of_community_social_care_all_ages:
                  'All types of community social care, including home care, supported living, community direct payments and other schemes',
                elss_community_home_care_all_ages: 'Home care',
                elss_community_supported_living_all_ages: 'Supported living',
                elss_community_direct_payments_all_ages:
                  'Community direct payments',
                elss_community_other_long_term_care_all_ages: 'Other',
                elss_supported_accommodation_all_ages: 'Supported accomodation',
              }}
              data={benchmarkedDemographicData}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
              totalsRows={[
                'elss_all_types_of_adult_social_care_all_ages',
                'elss_all_types_of_care_home_all_ages',
                'elss_all_types_of_community_social_care_all_ages',
                'elss_supported_accommodation_all_ages',
              ]}
            ></SubCatergoryTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref2}
                filename="funding_for_long_term_adult_social_care.csv"
                xLabel=""
                downloadType="LA funding for long-term adult social care for all age groups"
              />
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle={
          <>
            [REPLACE WITH REAL METRIC]:{' '}
            <abbr title="Local Authority">LA</abbr> funding for long-term adult
            social care &ndash; standardised per 100,000 adult population (18+)
          </>
        }
        dataInfo={
          <>
            <p className="govuk-body-m">
              Find out{' '}
              <a
                href={withBasePath(
                  '/help/total-financial-spend-long-term-community-adult-social-care'
                )}
                className="govuk-link"
              >
                how the financial spend is calculated by service type
              </a>
              .
            </p>
            {nhsPeerGroupDetails}
          </>
        }
      >
        <FilterSelectGroup
          filterType={CARE_TYPE_FILTER_KEY}
          filterLabel="Care type or funding method"
          filters={CARE_TYPE_OPTIONS}
          updateMethod={updateStandardisedCareTypeFilter}
        />
        <DataTabs
          id="5"
          sharingMetricIds={[chartCareType]}
          chart={
            <PeerGroupBarChart
              laCode={laCode}
              laName={locationNames.LALabel}
              currentLaValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === chartCareType && d.location_type === 'LA'
                )?.data_point ?? null
              }
              nationalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === chartCareType &&
                    d.location_type === 'National'
                )?.data_point ?? null
              }
              regionalAverageValue={
                benchmarkedDemographicData.find(
                  (d) =>
                    d.metric_id === chartCareType &&
                    d.location_type === 'Regional'
                )?.data_point ?? null
              }
              regionalAverageLabel={`${locationNames.RegionLabel} (regional average)`}
              peerData={dataByMetric[chartCareType] ?? null}
              loading={chartLoading}
              error={chartError}
              comparatorControl={renderComparatorControl('comparator-chart-5')}
              comparatorLabel={comparatorLabel}
              comparatorAverageLabel={comparatorAverageLabel}
              metricDescription={`long-term adult social care funding for ${(
                CARE_TYPE_OPTIONS as Record<string, string>
              )[chartCareType].toLowerCase()}, standardised per 100,000 adult population (18+)`}
              figureTitle={`Total LA funding for long-term adult social care for ${(
                CARE_TYPE_OPTIONS as Record<string, string>
              )[chartCareType].toLowerCase()}, for all age groups, standardised per 100,000 adult population (18+)`}
              figureNumber={2}
              dateLabel={IndicatorService.getFinancialYear(
                benchmarkedDemographicData,
                1
              )}
              sourceText="Source: Adult Social Care Finance Report from the Department of Health and Social Care (DHSC) and population estimates from ONS"
            />
          }
          table={
            <>
              {renderComparatorControl('comparator-table-5')}
              <SubCatergoryTable
                tableref={tableref5}
                caption={
                  <>
                    Table 5: total <abbr title="Local Authority">LA</abbr>{' '}
                    funding for long-term adult social care by support setting,
                    standardised per 100,000 adult population (18+) &ndash;{' '}
                    {locationNames.LALabel}{' '}
                    <abbr title="local authority">LA</abbr>,{' '}
                    {comparatorAverageLabel}, {locationNames.RegionLabel}{' '}
                    (regional average) and {locationNames.CountryLabel}{' '}
                    (national average),{' '}
                    {IndicatorService.getFinancialYear(
                      benchmarkedDemographicData,
                      1
                    )}
                  </>
                }
                source="Adult Social Care Finance Report from the Department of Health and Social Care (DHSC) and population estimates from ONS"
                columnHeaders={{
                  ...locationNamesWithAverageLabels,
                  ComparatorLabel: comparatorAverageLabel,
                }}
                metricColumnName="Care type or funding method"
                rowHeaders={{
                  [chartCareType]: (
                    CARE_TYPE_OPTIONS as Record<string, string>
                  )[chartCareType],
                }}
                data={benchmarkedDemographicData}
                showCareProvider={false}
                currency={true}
              ></SubCatergoryTable>
            </>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref5}
                filename="la_funding_long_term_care_standardised.csv"
                xLabel=""
                downloadType="total LA funding for long-term adult social care standardised per 100,000 adult population"
              />
            </>
          }
        />
      </DataBox>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l govuk-!-margin-top-9">Trends</h2>
        </div>
      </div>

      <DataBox
        dataTitle={
          <>
            <abbr title="Local Authority">LA</abbr> funding for long-term adult
            social care – trends over time
          </>
        }
        dataInfo={
          <p className="govuk-body-m">
            Find out{' '}
            <a
              href={withBasePath(
                '/help/total-financial-spend-long-term-care-trends-over-time'
              )}
              className="govuk-link"
            >
              how the financial spend on long-term adult social care is
              calculated
            </a>
            .
          </p>
        }
      >
        <FilterSelectGroup
          filterType="long-term-funding-support-type"
          filterLabel="Support setting"
          filters={supportSettingsForFundingTrends}
          updateMethod={updateLAFundingOverTimeFilter}
        />
        <DataTabs
          id="3"
          sharingMetricIds={demographicMetricIds.filter((id) =>
            id.startsWith('elss_')
          )}
          graph={
            <>
              <h4 className="govuk-heading-s">
                Figure 1: Total funding for long-term adult social care for{' '}
                {supportTypeFilterName.toLowerCase()} for all age groups –{' '}
                {locationNames.LALabel} <abbr title="Local Authority">LA</abbr>,{' '}
                {locationNames.RegionLabel} region and{' '}
                {locationNames.CountryLabel},{' '}
                {IndicatorService.getFinancialYear(
                  filteredDemographicData,
                  Object.keys(laFundingTableRowHeaders).length
                )}
              </h4>
              {(timeSeriesDataForGraph.length > 0 && (
                <div style={{ width: '100%', height: `500px` }}>
                  <TimeSeriesChart
                    series={timeSeriesDataForGraph}
                    yPrefix="£"
                    financialYear
                  />
                </div>
              )) || <p>Loading graph</p>}
              <p className="govuk-body">
                Source: Adult Social Care Finance Report from the Department of
                Health and Social Care
              </p>
            </>
          }
          table={
            <DataTable
              tableref={tableref3}
              caption={
                <>
                  Table 3: Total funding for long-term adult social care for{' '}
                  {supportTypeFilterName.toLowerCase()} for all age groups –{' '}
                  {locationNames.LALabel}{' '}
                  <abbr title="local authority">LA</abbr>,{' '}
                  {locationNames.RegionLabel} region and{' '}
                  {locationNames.CountryLabel},{' '}
                  {IndicatorService.getFinancialYear(
                    filteredDemographicData,
                    Object.keys(laFundingTableRowHeaders).length
                  )}
                </>
              }
              source={
                'Adult Social Care Finance Report from the Department of Health and Social Care'
              }
              columnHeaders={locationNamesWithAverageLabels}
              metricColumnName={metricColumnNames[2]}
              rowHeaders={laFundingTableRowHeaders}
              data={laFundingOverTimeDataForTable}
              showCareProvider={false}
              percentageRows={[]}
              currency={true}
            ></DataTable>
          }
          download={
            <>
              <DownloadTableDataCSVLink
                tableref={tableref3}
                filename="funding_for_long_term_adult_social_care.csv"
                xLabel=""
                downloadType="LA funding for long-term adult social care for all age groups - trends over time"
              />
            </>
          }
        />
      </DataBox>

      <DataIndicatorDetailsList>
        <DataLinkCard
          label={
            <>
              <abbr title="Local Authority">LA</abbr> funding for long-term
              adult social care
            </>
          }
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/total-financial-spend-long-term-community-adult-social-care"
        />
        <DataLinkCard
          label={
            <>
              <abbr title="Local Authority">LA</abbr> funding for short-term and
              long term adult social care
            </>
          }
          sources="NHS England"
          updateFrequency="Yearly updates"
          limitations={false}
          url="/help/percentages-financial-spend-long-term-and-short-term-care"
        />
      </DataIndicatorDetailsList>

      <LocalMarketInformation
        localAuthority={locationNames.LALabel}
        localAuthorityId={locationIds[1]}
      />
      <BackToTop />
    </Layout>
  );
}
