/**
 * Sharing categories for metrics (GASCD-217).
 *
 * Every metric in the service falls into one of three sharing categories. The
 * agreed categorisation is held in the GASCD Methodology spreadsheet
 * ("Indicators" sheet, "Label" and "Labelling Reasoning" columns). This module
 * is the source of truth for that categorisation in the service, so the label,
 * the sharing statement and the wording on the terms of use page cannot drift
 * apart.
 *
 * The spreadsheet uses its own label names. The user facing wording below is the
 * agreed service wording, which matches the definitions on the terms of use
 * page.
 */

import {
  CHILDREN_IN_NEED_METRIC_IDS,
  NUM_EHCP_14PLUS,
  NUM_EHCP_BY_AGE,
  NUM_SEN_SUPPORT_14PLUS,
  NUM_SEN_SUPPORT_BY_AGE,
  PERC_SEN_SUPPORT_14PLUS,
  PERC_SEN_SUPPORT_BY_AGE,
} from '@/data/dfeMetrics';

export type SharingCategoryId =
  | 'published'
  | 'discretion'
  | 'not-for-external-sharing';

export type SharingCategory = {
  id: SharingCategoryId;
  /** Label shown in the tag, matching the terms of use page */
  label: string;
  /** Sharing statement shown alongside the label */
  statement: string;
  /** Label name used in the GASCD Methodology spreadsheet */
  spreadsheetLabel: string;
  /** GOV.UK tag colour modifier class */
  tagModifier: string;
  /** Higher severity categories are shown with a warning icon */
  showWarningIcon: boolean;
  /** Extra note shown underneath the source line, where one applies */
  additionalSourceNote?: string;
  /**
   * How restrictive the category is. Used to pick the label for a chart, table
   * or download that draws on more than one metric: the most restrictive
   * category present always wins.
   */
  restrictiveness: number;
};

export const SHARING_CATEGORIES: Record<SharingCategoryId, SharingCategory> = {
  published: {
    id: 'published',
    label: 'Published data',
    statement: 'This data can be shared outside your organisation.',
    spreadsheetLabel: 'Approved for Public Use',
    tagModifier: 'govuk-tag--green',
    showWarningIcon: false,
    restrictiveness: 0,
  },
  discretion: {
    id: 'discretion',
    label: 'Share at your own discretion',
    statement:
      'You can only share data externally where it was provided by your organisation.',
    spreadsheetLabel: 'Shareable at Your Discretion',
    tagModifier: 'govuk-tag--blue',
    showWarningIcon: true,
    restrictiveness: 1,
  },
  'not-for-external-sharing': {
    id: 'not-for-external-sharing',
    label: 'Not for sharing externally',
    statement:
      'The data in the chart is not to be shared outside your organisation.',
    spreadsheetLabel: 'Not for External Sharing',
    tagModifier: 'govuk-tag--orange',
    showWarningIcon: true,
    additionalSourceNote:
      'This data is not for sharing with AI tools that are outwards facing (i.e. where content may be used for training of AI models)',
    restrictiveness: 2,
  },
};

export type SharingReason = {
  /** The category this reasoning always leads to */
  category: SharingCategoryId;
  /** The reasoning as recorded in the spreadsheet */
  text: string;
};

/**
 * The reasoning recorded against each metric in the "Labelling Reasoning"
 * column of the GASCD Methodology spreadsheet, shown in the "Sharing rules" row
 * on the data indicator details pages.
 *
 * Each reason carries its own category, so a page cannot pair a reason with a
 * category that contradicts it.
 */
export const SHARING_REASONS = {
  publicDomain: {
    category: 'published',
    text: 'In the public domain.',
  },
  capacityTrackerRestricted: {
    category: 'not-for-external-sharing',
    text: 'Derived from Capacity Tracker data, which is protected by a data sharing agreement. This means you cannot share it externally.',
  },
  capacityTrackerOwnOrganisation: {
    category: 'discretion',
    text: 'Derived from Capacity Tracker data, which is protected by a data sharing agreement. This means you can only share data at care provider level, as it is your own organisation’s data.',
  },
  poppiPansiRestricted: {
    category: 'not-for-external-sharing',
    text: 'This view-only system is funded by the Institute of Public Care (IPC). It is for use by local authority planners and commissioners of social care provision in England. Registration is restricted to those who work in local and national government, the NHS, provider and academic organisations.',
  },
} as const satisfies Record<string, SharingReason>;

export type SharingReasonKey = keyof typeof SHARING_REASONS;

/**
 * Metric level categorisation, taken from the "Indicators" sheet of the GASCD
 * Methodology spreadsheet. The comment against each group gives the row numbers
 * in that sheet so the mapping can be checked against the agreed list.
 */
export const METRIC_SHARING_CATEGORIES: Record<string, SharingCategoryId> = {
  // Rows 1 to 5: population size and age
  total_population: 'published',
  perc_18_64: 'published',
  perc_65over: 'published',
  perc_75over: 'published',
  perc_85over: 'published',

  // Rows 6 to 8: household composition and economic factors
  perc_households_deprivation_deprived: 'published',
  perc_household_ownership: 'published',
  perc_households_one_person: 'published',

  // Row 9: unpaid care
  perc_unpaid_care_provider: 'published',

  // Rows 10 to 12: disability and long term support
  perc_population_disability: 'published',
  perc_general_health: 'published',
  learning_disability_prevalence: 'published',

  // Rows 13 and 14: dementia prevalence
  dementia_qof_prevalence: 'published',
  dementia_estimated_diagnosis_rate_65over: 'published',

  // Row 15: percentage of adult social care beds occupied (LA, region, England)
  median_occupancy_total: 'not-for-external-sharing',

  // Row 16: beds and occupancy in a care provider location, and the medians it
  // is compared against
  bedcount_total: 'discretion',
  occupancy_rate_total: 'discretion',
  median_bed_count_total: 'discretion',

  // Rows 17 to 28: adult social care beds per 100,000 adult population
  bedcount_per_hundred_thousand_adults_total: 'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_community_care:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_dementia_nursing:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_dementia_residential:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_general_nursing:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_general_residential:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_learning_disability_nursing:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_learning_disability_residential:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_mental_health_nursing:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_mental_health_residential:
    'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_transitional: 'not-for-external-sharing',
  bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled:
    'not-for-external-sharing',

  // Rows 29 to 32 and 35 to 41: care provider locations and services
  npl_adult_social_care: 'published',
  npl_care_home: 'published',
  npl_care_home_nursing: 'published',
  npl_care_home_residential: 'published',
  npl_community_care: 'published',
  npl_domiciliary_care: 'published',
  npl_extra_care_housing: 'published',
  npl_other_community_care: 'published',
  npl_supported_living: 'published',

  // Rows 33 and 34: people receiving community social care
  nccc_num_clients_comm_care: 'discretion',
  nccc_perc_clients_comm_care: 'discretion',

  // Rows 42 to 49: gross current expenditure on long term care
  elss_all_types_of_adult_social_care_all_ages: 'published',
  elss_all_types_of_care_home_all_ages: 'published',
  elss_all_types_of_community_social_care_all_ages: 'published',
  elss_community_direct_payments_all_ages: 'published',
  elss_community_home_care_all_ages: 'published',
  elss_community_other_long_term_care_all_ages: 'published',
  elss_community_supported_living_all_ages: 'published',
  elss_nursing_all_ages: 'published',
  elss_residential_all_ages: 'published',
  elss_supported_accommodation_all_ages: 'published',

  // Rows 50 to 53: LA funded net current expenditure
  edpsr_lt_learning_disability_support_all_ages: 'published',
  edpsr_lt_mental_health_support_all_ages: 'published',
  edpsr_lt_physical_support_all_ages: 'published',
  edpsr_lt_sensory_support_all_ages: 'published',
  edpsr_lt_support_with_memory_and_cognition_all_ages: 'published',
  edpsr_lt_total_all_ages: 'published',
  edpsr_st_learning_disability_support_all_ages: 'published',
  edpsr_st_mental_health_support_all_ages: 'published',
  edpsr_st_physical_support_all_ages: 'published',
  edpsr_st_sensory_support_all_ages: 'published',
  edpsr_st_support_with_memory_and_cognition_all_ages: 'published',
  edpsr_st_total_all_ages: 'published',
  edpsr_stlt_total_all_ages: 'published',

  // Rows 54 to 64: primary reason for accessing long term adult social care
  access_and_mobility_only_physical_support_18_and_over: 'published',
  personal_care_support_physical_support_18_and_over: 'published',
  support_for_visual_impairment_sensory_support_18_and_over: 'published',
  support_for_hearing_impairment_sensory_support_18_and_over: 'published',
  support_for_dual_impairment_sensory_support_18_and_over: 'published',
  support_with_memory_and_cognition_18_and_over: 'published',
  learning_disability_support_18_and_over: 'published',
  mental_health_support_18_and_over: 'published',
  substance_misuse_support_social_support_18_and_over: 'published',
  asylum_seeker_support_social_support_18_and_over: 'published',
  support_for_social_isolation_other_social_support_18_and_over: 'published',

  // Rows 65 to 68: POPPI and PANSI future planning projections
  pansi_pred_pop_asd_aged_18_64: 'not-for-external-sharing',
  pansi_pred_pop_challenging_behaviour_aged_18_64: 'not-for-external-sharing',
  pansi_pred_pop_early_dem_aged_30_64: 'not-for-external-sharing',

  // Department for Education future planning metrics. All are published
  // national statistics, so the whole set is in the public domain.
  ...Object.fromEntries(
    [
      NUM_SEN_SUPPORT_14PLUS,
      ...Object.keys(NUM_SEN_SUPPORT_BY_AGE),
      PERC_SEN_SUPPORT_14PLUS,
      ...Object.keys(PERC_SEN_SUPPORT_BY_AGE),
      NUM_EHCP_14PLUS,
      ...Object.keys(NUM_EHCP_BY_AGE),
      ...CHILDREN_IN_NEED_METRIC_IDS,
    ].map((metricId) => [metricId, 'published' as SharingCategoryId])
  ),
};

/**
 * The category that applies when a metric has not been categorised. Defaults to
 * the most restrictive category so an uncategorised metric can never be
 * presented as safe to share.
 */
export const DEFAULT_SHARING_CATEGORY_ID: SharingCategoryId =
  'not-for-external-sharing';

/**
 * Suffixes the service appends to metric ids when it derives series from a base
 * metric. Stripping them lets those derived series inherit the category of the
 * metric they come from.
 */
const DERIVED_METRIC_SUFFIXES = ['_yearly', '_perc_change'];

const baseMetricId = (metricId: string): string => {
  let id = metricId;
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of DERIVED_METRIC_SUFFIXES) {
      if (id.endsWith(suffix)) {
        id = id.slice(0, -suffix.length);
        changed = true;
      }
    }
  }
  return id;
};

export const getSharingCategoryById = (
  id: SharingCategoryId
): SharingCategory => SHARING_CATEGORIES[id];

export const getSharingCategoryForMetric = (
  metricId: string
): SharingCategory => {
  const id =
    METRIC_SHARING_CATEGORIES[metricId] ??
    METRIC_SHARING_CATEGORIES[baseMetricId(metricId)] ??
    DEFAULT_SHARING_CATEGORY_ID;
  return SHARING_CATEGORIES[id];
};

/**
 * Resolves the single category to show for a chart, table or download built
 * from one or more metrics. The most restrictive category present wins, so a
 * mixed view is never labelled less restrictively than one of its metrics
 * requires.
 */
export const resolveSharingCategory = (
  metricIds: string[] | undefined
): SharingCategory | undefined => {
  if (!metricIds?.length) return undefined;

  return metricIds
    .map(getSharingCategoryForMetric)
    .reduce((mostRestrictive, category) =>
      category.restrictiveness > mostRestrictive.restrictiveness
        ? category
        : mostRestrictive
    );
};

/**
 * Sharing categorisation for each data indicator details page, keyed by the
 * last segment of its route (`/help/<slug>`).
 *
 * Held here rather than as props on each page so the whole set can be checked
 * against the GASCD Methodology spreadsheet in one place. Adding a details page
 * means adding a line here; `getSharingForHelpPage` warns in development if a
 * page has been missed.
 */
export const HELP_PAGE_SHARING = {
  'beds-care-provider-location': 'capacityTrackerOwnOrganisation',
  'beds-per-100000-adult-population': 'capacityTrackerRestricted',
  'beds-per-100000-adult-population-over-time': 'capacityTrackerRestricted',
  'children-and-young-people-with-an-ehcp-aged-14-and-over': 'publicDomain',
  'children-in-need': 'publicDomain',
  'children-in-need-episodes-ending-due-to-transfer-to-adult-social-care':
    'publicDomain',
  'children-in-need-per-10000-children': 'publicDomain',
  'dementia-prevalence': 'publicDomain',
  'disability-prevalence': 'publicDomain',
  'estimated-dementia-diagnosis-rate-aged-65-and-over': 'publicDomain',
  'estimated-population-asd': 'poppiPansiRestricted',
  'estimated-population-early-onset-dementia': 'poppiPansiRestricted',
  'estimated-population-learning-disability': 'poppiPansiRestricted',
  'household-deprivation': 'publicDomain',
  'households-where-property-is-owned-outright': 'publicDomain',
  'learning-disability-prevalence': 'publicDomain',
  'number-people-receiving-care-from-community-social-care-provider':
    'capacityTrackerOwnOrganisation',
  'one-person-households-where-person-aged-65-or-over': 'publicDomain',
  'people-who-reported-bad-or-very-bad-health': 'publicDomain',
  'percentage-beds-occupied': 'capacityTrackerRestricted',
  'percentage-beds-occupied-care-provider-location':
    'capacityTrackerOwnOrganisation',
  'percentage-of-pupils-with-sen-support-aged-14-and-over': 'publicDomain',
  'percentage-people-aged-5-and-over-who-provide-unpaid-care': 'publicDomain',
  'percentages-financial-spend-long-term-and-short-term-care': 'publicDomain',
  'population-age': 'publicDomain',
  'population-size': 'publicDomain',
  'primary-reason-for-accessing-long-term-adult-social-care': 'publicDomain',
  'pupils-with-sen-support-aged-14-and-over': 'publicDomain',
  'total-financial-spend-long-term-care-trends-over-time': 'publicDomain',
  'total-financial-spend-long-term-community-adult-social-care': 'publicDomain',
  'total-number-community-social-care-providers': 'publicDomain',
} as const satisfies Record<string, SharingReasonKey>;

export type SharingForHelpPage = {
  category: SharingCategory;
  reasoning: string;
};

/**
 * Resolves the sharing category and reasoning for a data indicator details
 * page from its route. Matching on the last segment keeps this working under a
 * configured BASE_PATH.
 */
export const getSharingForHelpPage = (
  pathname: string | null | undefined
): SharingForHelpPage | undefined => {
  const slug = pathname?.split('/').filter(Boolean).pop();
  if (!slug) return undefined;

  const reasonKey = (HELP_PAGE_SHARING as Record<string, SharingReasonKey>)[
    slug
  ];
  if (!reasonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `No sharing category held for data indicator details page "${slug}". ` +
          'Add it to HELP_PAGE_SHARING in src/data/sharingCategories.ts, ' +
          'using the agreed label from the GASCD Methodology spreadsheet.'
      );
    }
    return undefined;
  }

  const reason = SHARING_REASONS[reasonKey];
  return {
    category: SHARING_CATEGORIES[reason.category],
    reasoning: reason.text,
  };
};

/**
 * Usage guidance carried into a downloaded CSV, so the sharing rules travel
 * with the data once it leaves the service.
 */
export const getSharingCsvNotice = (
  category: SharingCategory | undefined
): string[] => {
  if (!category) return [];

  const notice = [`Sharing label: ${category.label}`, category.statement];
  if (category.additionalSourceNote) {
    notice.push(category.additionalSourceNote);
  }
  return notice;
};
