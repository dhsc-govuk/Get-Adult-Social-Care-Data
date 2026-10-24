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
  fingertipsPublicHealth:
    'Fingertips public health profiles from the Department of Health and Social Care (DHSC)',
  ascActivityReport:
    'Adult Social Care Activity Report from Department of Health and Social Care (DHSC)',
  ascActivityFinanceWithOnsPopulation:
    'Adult Social Care Activity and Finance Report from NHS England & population estimates from ONS',
  ascFinanceReport:
    'Adult Social Care Finance Report from the Department of Health and Social Care',
  ascFinanceReportWithOnsPopulation:
    'Adult Social Care Finance Report from the Department of Health and Social Care (DHSC) and population estimates from ONS',
  onsPopulationEstimates:
    'Population estimates from the Office for National Statistics (ONS)',
  capacityTrackerWithOnsPopulation:
    'Capacity Tracker from the Department of Health and Social Care (DHSC) & population estimates from ONS',
} as const;

export type MetricFormat = 'number' | 'percentage' | 'currency';

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

// Primary support reasons, each with a count and a per 100,000 adults twin
const SUPPORT_REASONS = {
  learning_disability_support_18_and_over: 'Learning disability support',
  mental_health_support_18_and_over: 'Mental health support',
  access_and_mobility_only_physical_support_18_and_over:
    'Physical support: Access and mobility only',
  personal_care_support_physical_support_18_and_over:
    'Physical support: Personal care support',
  support_for_dual_impairment_sensory_support_18_and_over:
    'Sensory support: Support for dual impairment',
  support_for_hearing_impairment_sensory_support_18_and_over:
    'Sensory support: Support for hearing impairment',
  support_for_visual_impairment_sensory_support_18_and_over:
    'Sensory support: Support for visual impairment',
  asylum_seeker_support_social_support_18_and_over:
    'Social support: Asylum seeker support',
  substance_misuse_support_social_support_18_and_over:
    'Social support: Substance misuse support',
  support_for_social_isolation_other_social_support_18_and_over:
    'Social support: Support for social isolation or other reason',
  support_with_memory_and_cognition_18_and_over:
    'Support with memory and cognition',
} as const;

type SupportReasonId = keyof typeof SUPPORT_REASONS;

const supportReasonMetrics = Object.fromEntries(
  Object.entries(SUPPORT_REASONS).flatMap(([id, label]) => [
    [
      id,
      {
        label,
        format: 'number',
        source: SOURCES.ascActivityReport,
        helpUrl:
          '/help/primary-reason-for-accessing-long-term-adult-social-care',
      },
    ],
    [
      `${id}_per100k_adults`,
      {
        label,
        format: 'number',
        source: SOURCES.ascActivityFinanceWithOnsPopulation,
        helpUrl:
          '/help/primary-reason-for-accessing-long-term-adult-social-care-per-100000-adults',
      },
    ],
  ])
) as Record<
  SupportReasonId | `${SupportReasonId}_per100k_adults`,
  MetricConfig & { helpUrl: string }
>;

// LA spending (thousands of pounds) by duration of care and primary support
// reason (edpsr_), and long-term spending by support setting (elss_). Each has
// a per 100,000 adults twin.
const SPENDING = {
  edpsr_stlt_total_all_ages: 'Both short-term and long-term',
  edpsr_lt_total_all_ages: 'Long-term',
  edpsr_lt_learning_disability_support_all_ages: 'Learning disability support',
  edpsr_lt_mental_health_support_all_ages: 'Mental health support',
  edpsr_lt_physical_support_all_ages: 'Physical support',
  edpsr_lt_sensory_support_all_ages: 'Sensory support',
  edpsr_lt_support_with_memory_and_cognition_all_ages:
    'Support with memory and cognition',
  edpsr_st_total_all_ages: 'Short-term',
  edpsr_st_learning_disability_support_all_ages: 'Learning disability support',
  edpsr_st_mental_health_support_all_ages: 'Mental health support',
  edpsr_st_physical_support_all_ages: 'Physical support',
  edpsr_st_sensory_support_all_ages: 'Sensory support',
  edpsr_st_support_with_memory_and_cognition_all_ages:
    'Support with memory and cognition',
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
  elss_community_direct_payments_all_ages: 'Community direct payments',
  elss_community_other_long_term_care_all_ages: 'Other',
  // Typo is on the live site; fix separately so this refactor changes nothing
  elss_supported_accommodation_all_ages: 'Supported accomodation',
} as const;

type SpendingId = keyof typeof SPENDING;

const spendingHelpUrls = (id: string) =>
  id.startsWith('edpsr_')
    ? {
        count:
          '/help/percentages-financial-spend-long-term-and-short-term-care',
        per100k:
          '/help/financial-spend-long-term-and-short-term-care-per-100000-adults',
      }
    : {
        count:
          '/help/total-financial-spend-long-term-community-adult-social-care',
        per100k: '/help/financial-spend-long-term-care-per-100000-adults',
      };

const spendingMetrics = Object.fromEntries(
  Object.entries(SPENDING).flatMap(([id, label]) => [
    [
      id,
      {
        label,
        format: 'currency',
        source: SOURCES.ascFinanceReport,
        helpUrl: spendingHelpUrls(id).count,
      },
    ],
    [
      `${id}_per100k_adults`,
      {
        label,
        format: 'currency',
        source: SOURCES.ascFinanceReportWithOnsPopulation,
        helpUrl: spendingHelpUrls(id).per100k,
      },
    ],
  ])
) as Record<
  SpendingId | `${SpendingId}_per100k_adults`,
  MetricConfig & { helpUrl: string }
>;

export const METRICS = {
  ...supportReasonMetrics,
  ...spendingMetrics,

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

  perc_households_deprivation_deprived: {
    label:
      'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/household-deprivation',
  },
  perc_household_ownership: {
    label: 'Percentage of households where the property is owned outright',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/households-where-property-is-owned-outright',
  },
  perc_households_one_person: {
    label:
      'Percentage of one-person households where the person is aged 65 or over',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/one-person-households-where-person-aged-65-or-over',
  },

  perc_general_health: {
    label: 'People who reported bad or very bad health',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/people-who-reported-bad-or-very-bad-health',
  },
  perc_population_disability: {
    label:
      'Disability prevalence – people who reported a long-term physical or mental health condition, or illness that limits day-to-day activities',
    format: 'percentage',
    source: SOURCES.census2021,
    helpUrl: '/help/disability-prevalence',
  },
  learning_disability_prevalence: {
    label: 'Learning disability prevalence',
    format: 'percentage',
    source: SOURCES.fingertipsPublicHealth,
    helpUrl: '/help/learning-disability-prevalence',
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
