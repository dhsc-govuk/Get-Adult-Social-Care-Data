/**
 * Labels, formats and sources for each metric, so every table, chart and
 * download names a metric the same way. Pages are moved onto this one at a
 * time (GASCD-350); the screenshot tests in visual_tests check nothing changes.
 */

export const SOURCES = {
  pansi:
    'Projected Adult Needs and Service Information (PANSI) v15 August 2025 from the Institute of Public Care',
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
