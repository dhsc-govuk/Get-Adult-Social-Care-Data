import { Indicator } from '@/data/interfaces/Indicator';
import { PeerGroupData } from './types';
import { COMPARATOR_AVERAGE_LOCATION_TYPE } from './constants';

// The real Regional row (the user's ONS region average) is preserved from the
// metric-data response: the selected comparator group's average is added as a
// separate ComparatorAverage row. The metrics API does not always return a
// Regional row for a metric (for example Census metrics only have LA and
// National values), so the Regional column renders as unavailable there while
// the comparator average is still shown when the peer-group data resolved.
export const mergeComparatorAverage = (
  data: Indicator[],
  metricIds: string[],
  dataByMetric: Record<string, PeerGroupData | null>,
  regionLocationId: string = 'comparator-average'
): Indicator[] => {
  const merged = data.map((d) => ({ ...d }));

  metricIds.forEach((metricId) => {
    const hasComparatorRow = merged.some(
      (d) =>
        d.metric_id === metricId &&
        d.location_type === COMPARATOR_AVERAGE_LOCATION_TYPE
    );
    if (hasComparatorRow) return;

    // Borrow date/type metadata from any existing row for the metric so the
    // synthesised row looks like the others (e.g. for CSV download)
    const template = merged.find((d) => d.metric_id === metricId);
    if (!template) return;

    merged.push({
      ...template,
      location_type: COMPARATOR_AVERAGE_LOCATION_TYPE,
      location_id: regionLocationId,
      numerator: NaN,
      denominator: NaN,
      data_point: dataByMetric[metricId]?.averagePeerGroup ?? null,
    });
  });

  return merged;
};
