import { describe, it, expect } from 'vitest';
import { METRICS, metricLabels, percentageMetrics } from '@/config/metrics';

describe('metric config', () => {
  it('gives row headers in the order asked for', () => {
    expect(
      Object.keys(
        metricLabels([
          'pansi_pred_pop_asd_aged_18_64',
          'pansi_pred_pop_early_dem_aged_30_64',
        ])
      )
    ).toEqual([
      'pansi_pred_pop_asd_aged_18_64',
      'pansi_pred_pop_early_dem_aged_30_64',
    ]);
  });

  it('picks out the percentage metrics', () => {
    expect(
      percentageMetrics([
        'pansi_pred_pop_asd_aged_18_64',
        'pansi_pred_pop_asd_aged_18_64_perc_change',
      ])
    ).toEqual(['pansi_pred_pop_asd_aged_18_64_perc_change']);
  });

  it('gives every metric a label and source', () => {
    Object.values(METRICS).forEach((metric) => {
      expect(metric.label).not.toBe('');
      expect(metric.source).not.toBe('');
    });
  });
});
