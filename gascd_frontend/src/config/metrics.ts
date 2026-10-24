/**
 * Labels, formats and sources for each metric, so every table, chart and
 * download names a metric the same way. Pages are moved onto this one at a
 * time (GASCD-350); the screenshot tests in visual_tests check nothing changes.
 */

export const SOURCES = {
  pansi:
    'Projected Adult Needs and Service Information (PANSI) v15 August 2025 from the Institute of Public Care',
  cqcCareDirectory: 'Care Directory from the Care Quality Commission (CQC)',
  census2021: 'Census 2021 from the Office for National Statistics (ONS)',
  capacityTracker:
    'Capacity Tracker from the Department of Health and Social Care (DHSC)',
  fingertips: 'Fingertips from the Department of Health and Social Care (DHSC)',
  onsPopulationEstimates:
    'Population estimates from the Office for National Statistics (ONS)',
  capacityTrackerWithOnsPopulation:
    'Capacity Tracker from the Department of Health and Social Care (DHSC) & population estimates from ONS',
} as const;

export type MetricFormat = 'number' | 'percentage';

export type MetricConfig = {
  label: string;
  format: MetricFormat;
  source: string;
  helpUrl?: string;
};

const EARLY_ONSET_DEMENTIA =
  'Total population aged 30-64 predicted to have early onset dementia';
const CHALLENGING_BEHAVIOUR =
  'Total population aged 18-64 with a learning disability, predicted to display challenging behaviour';
const AUTISTIC_SPECTRUM =
  'Total population aged 18-64 predicted to have autistic spectrum disorders';

export const METRICS = {
  pansi_pred_pop_early_dem_aged_30_64: {
    label: EARLY_ONSET_DEMENTIA,
    format: 'number',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-early-onset-dementia',
  },
  pansi_pred_pop_challenging_behaviour_aged_18_64: {
    label: CHALLENGING_BEHAVIOUR,
    format: 'number',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-learning-disability',
  },
  pansi_pred_pop_asd_aged_18_64: {
    label: AUTISTIC_SPECTRUM,
    format: 'number',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-asd',
  },
  pansi_pred_pop_early_dem_aged_30_64_perc_change: {
    label: EARLY_ONSET_DEMENTIA,
    format: 'percentage',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-early-onset-dementia',
  },
  pansi_pred_pop_challenging_behaviour_aged_18_64_perc_change: {
    label: CHALLENGING_BEHAVIOUR,
    format: 'percentage',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-learning-disability',
  },
  pansi_pred_pop_asd_aged_18_64_perc_change: {
    label: AUTISTIC_SPECTRUM,
    format: 'percentage',
    source: SOURCES.pansi,
    helpUrl: '/help/estimated-population-asd',
  },

  // Residential care providers: labels are the rows of a sub-category table
  npl_adult_social_care: {
    label: 'Total adult social care providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_care_home: {
    label: 'Care home providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_care_home_nursing: {
    label: 'Nursing',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_care_home_residential: {
    // Typo is on the live site; fix separately so this refactor changes nothing
    label: 'Residental',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_community_care: {
    label: 'Community social care providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_domiciliary_care: {
    label: 'Home care providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_supported_living: {
    label: 'Supported living providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_extra_care_housing: {
    label: 'Extra care housing providers',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },
  npl_other_community_care: {
    label: 'Other community based care provider',
    format: 'number',
    source: SOURCES.cqcCareDirectory,
    helpUrl: '/help/total-number-community-social-care-providers',
  },

  perc_unpaid_care_provider: {
    label: 'Percentage of people aged 5 or over who provide unpaid care',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/percentage-people-aged-5-and-over-who-provide-unpaid-care',
  },

  nccc_num_clients_comm_care: {
    label: 'People receiving community social care',
    format: 'number',
    source: SOURCES.capacityTracker,
    helpUrl:
      '/help/number-people-receiving-care-from-community-social-care-provider',
  },
  nccc_num_clients_comm_care_per100k_adults: {
    label: 'People receiving community social care, per 100,000 adults',
    format: 'number',
    source: SOURCES.capacityTrackerWithOnsPopulation,
    helpUrl:
      '/help/number-people-receiving-care-from-community-social-care-provider-per-100000-adults',
  },

  dementia_qof_prevalence: {
    label:
      'Dementia prevalence - all ages, as a proportion of people registered at GP practices',
    format: 'percentage',
    source: SOURCES.fingertips,
    helpUrl: '/help/dementia-prevalence',
  },

  total_population: {
    label: 'Total adult population',
    format: 'number',
    source: SOURCES.onsPopulationEstimates,
    helpUrl: '/help/population-size',
  },
  perc_18_64: {
    label: 'Aged 18 to 64',
    format: 'percentage',
    source: SOURCES.onsPopulationEstimates,
    helpUrl: '/help/population-age',
  },
  perc_65over: {
    label: 'Aged 65 and over',
    format: 'percentage',
    source: SOURCES.onsPopulationEstimates,
    helpUrl: '/help/population-age',
  },
  perc_75over: {
    label: 'Aged 75 and over',
    format: 'percentage',
    source: SOURCES.onsPopulationEstimates,
    helpUrl: '/help/population-age',
  },
  perc_85over: {
    label: 'Aged 85 and over',
    format: 'percentage',
    source: SOURCES.onsPopulationEstimates,
    helpUrl: '/help/population-age',
  },
} as const satisfies Record<string, MetricConfig>;

export type MetricId = keyof typeof METRICS;

/** Metric id to label, in the order given, for a table's `rowHeaders` */
export const metricLabels = (
  ids: readonly MetricId[]
): Record<string, string> =>
  Object.fromEntries(ids.map((id) => [id, METRICS[id].label]));

/** The ids shown as percentages, for a table's `percentageRows` */
export const percentageMetrics = (ids: readonly MetricId[]): MetricId[] =>
  ids.filter((id) => METRICS[id].format === 'percentage');
