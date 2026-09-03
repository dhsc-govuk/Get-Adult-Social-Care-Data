/**
 * Metric ids and shared labelling for the Department for Education (DfE)
 * future planning metrics.
 *
 * Held in one place because the same ids are needed by the two data pages, the
 * sharing categorisation and the tests. The age breakdown ids follow the
 * `<measure>_age_<age>` convention used by the DfE loader.
 */

export const SEN_SOURCE =
  'Special educational needs in England, Department for Education (DfE)';

export const EHCP_SOURCE =
  'Education, Health and Care Plans in England, Department for Education (DfE)';

export const CIN_SOURCE =
  'Children in need in England, Department for Education (DfE)';

/** Number of pupils aged 14+ with SEN support, over an academic year */
export const NUM_SEN_SUPPORT_14PLUS = 'num_sen_support_14plus';

/** Percentage of pupils aged 14+ with SEN support, over an academic year */
export const PERC_SEN_SUPPORT_14PLUS = 'perc_sen_support_14plus';

/** Number of children and young people aged 14+ with an EHCP */
export const NUM_EHCP_14PLUS = 'num_ehcp_14plus';

export const NUM_CHILDREN_IN_NEED = 'num_children_in_need';
export const CIN_PER_10000_CHILDREN = 'cin_per_10000_children';
export const NUM_CIN_TRANSFER_ASC = 'num_cin_transfer_asc';

/**
 * The age breakdown rows, in the order they are shown. SEN support is
 * published for ages 14 to 18 with a single "19 and over" band, whereas EHCPs
 * run to age 25 and are published for each year.
 */
const SEN_AGE_SUFFIXES = [
  ['age_14', 'Age 14'],
  ['age_15', 'Age 15'],
  ['age_16', 'Age 16'],
  ['age_17', 'Age 17'],
  ['age_18', 'Age 18'],
  ['age_19_and_over', 'Age 19+'],
] as const;

const EHCP_AGE_SUFFIXES = [
  ['age_14', 'Age 14'],
  ['age_15', 'Age 15'],
  ['age_16', 'Age 16'],
  ['age_17', 'Age 17'],
  ['age_18', 'Age 18'],
  ['age_19', 'Age 19'],
  ['age_20', 'Age 20'],
  ['age_21', 'Age 21'],
  ['age_22', 'Age 22'],
  ['age_23', 'Age 23'],
  ['age_24', 'Age 24'],
  ['age_25', 'Age 25'],
] as const;

const ageBreakdown = (
  prefix: string,
  suffixes: ReadonlyArray<readonly [string, string]>
): Record<string, string> =>
  Object.fromEntries(
    suffixes.map(([suffix, label]) => [`${prefix}_${suffix}`, label])
  );

/** Metric id to age label, in display order, for each age breakdown */
export const NUM_SEN_SUPPORT_BY_AGE = ageBreakdown(
  'num_sen_support',
  SEN_AGE_SUFFIXES
);
export const PERC_SEN_SUPPORT_BY_AGE = ageBreakdown(
  'perc_sen_support',
  SEN_AGE_SUFFIXES
);
export const NUM_EHCP_BY_AGE = ageBreakdown('num_ehcp', EHCP_AGE_SUFFIXES);

/** Every metric shown on the SEN and EHCP page */
export const SEN_EHCP_METRIC_IDS = [
  NUM_SEN_SUPPORT_14PLUS,
  ...Object.keys(NUM_SEN_SUPPORT_BY_AGE),
  PERC_SEN_SUPPORT_14PLUS,
  ...Object.keys(PERC_SEN_SUPPORT_BY_AGE),
  NUM_EHCP_14PLUS,
  ...Object.keys(NUM_EHCP_BY_AGE),
];

/**
 * INTERIM (GASCD-236). The metrics whose Regional and National rows the DfE
 * pipeline stores as totals across local authorities, rather than as the
 * averages the service presents them as.
 *
 * Counts only. The percentage and per-10,000 metrics are already rates, and
 * dividing those by the number of authorities would be meaningless - an
 * England figure of 45% would read as 0.3%.
 */
export const TOTALLED_METRIC_IDS = [
  NUM_SEN_SUPPORT_14PLUS,
  ...Object.keys(NUM_SEN_SUPPORT_BY_AGE),
  NUM_EHCP_14PLUS,
  ...Object.keys(NUM_EHCP_BY_AGE),
  NUM_CHILDREN_IN_NEED,
  NUM_CIN_TRANSFER_ASC,
];

/** Every metric shown on the children in need page */
export const CHILDREN_IN_NEED_METRIC_IDS = [
  NUM_CHILDREN_IN_NEED,
  CIN_PER_10000_CHILDREN,
  NUM_CIN_TRANSFER_ASC,
];

/**
 * Turns the year a yearly series is reported against into the academic year it
 * covers. The DfE publishes against the year the academic year ends in, so
 * "2024" covers the 2023 to 2024 academic year.
 */
export const academicYearLabel = (year: string | number): string => {
  const endYear = Number(year);
  if (!Number.isFinite(endYear)) return String(year);
  return `${endYear - 1} to ${endYear}`;
};

/** The short form used in headings, for example "2023/24" */
export const shortAcademicYearLabel = (year: string | number): string => {
  const endYear = Number(year);
  if (!Number.isFinite(endYear)) return String(year);
  return `${endYear - 1}/${String(endYear).slice(-2)}`;
};
