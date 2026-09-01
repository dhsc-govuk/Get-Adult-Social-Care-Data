import { Indicator } from '@/data/interfaces/Indicator';
import { PeerGroupData } from './types';

// The table's "Regional" column is repurposed to show the selected comparator
// group's average. The metrics API does not always return a Regional row for a
// metric (for example Census metrics only have LA and National values), so we
// cannot rely on overwriting an existing row: when one is missing we synthesise
// it from the peer-group data, otherwise the table shows "--" while the chart
// shows the average.
export const mergeComparatorAverage = (
  data: Indicator[],
  metricIds: string[],
  dataByMetric: Record<string, PeerGroupData | null>,
  regionLocationId: string = 'comparator-average'
): Indicator[] => {
  const merged = data.map((d) =>
    d.location_type === 'Regional'
      ? {
          ...d,
          data_point: dataByMetric[d.metric_id]?.averagePeerGroup ?? null,
        }
      : d
  );

  metricIds.forEach((metricId) => {
    const hasRegionalRow = merged.some(
      (d) => d.metric_id === metricId && d.location_type === 'Regional'
    );
    if (hasRegionalRow) return;

    // Borrow date/type metadata from any existing row for the metric so the
    // synthesised row looks like the others (e.g. for CSV download)
    const template = merged.find((d) => d.metric_id === metricId);
    if (!template) return;

    merged.push({
      ...template,
      location_type: 'Regional',
      location_id: regionLocationId,
      numerator: NaN,
      denominator: NaN,
      data_point: dataByMetric[metricId]?.averagePeerGroup ?? null,
    });
  });

  return merged;
};
