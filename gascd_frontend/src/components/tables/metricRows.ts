import {
  METRICS,
  MetricId,
  metricLabels,
  percentageMetrics,
} from '@/config/metrics';

export type MetricRowProps = {
  // Rows read from the metric config: labels, % or £ formatting and source
  metrics?: readonly MetricId[];
  // Otherwise the rows are given directly, e.g. one row per year
  rowHeaders?: Object;
  percentageRows?: string[];
  currency?: boolean;
  source?: string;
};

const sharedSource = (metrics: readonly MetricId[]): string => {
  const sources = new Set(metrics.map((id) => METRICS[id].source));
  if (sources.size !== 1) {
    throw new Error(
      `Metrics ${metrics.join(', ')} have different sources; pass source`
    );
  }
  return [...sources][0];
};

export const resolveMetricRows = ({
  metrics,
  rowHeaders,
  percentageRows,
  currency,
  source,
}: MetricRowProps) =>
  metrics
    ? {
        rowHeaders: metricLabels(metrics),
        percentageRows: percentageMetrics(metrics),
        currency: metrics.every((id) => METRICS[id].format === 'currency'),
        source: source ?? sharedSource(metrics),
      }
    : { rowHeaders: rowHeaders ?? {}, percentageRows, currency, source };
