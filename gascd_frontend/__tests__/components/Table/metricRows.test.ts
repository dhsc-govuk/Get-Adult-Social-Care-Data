import { describe, it, expect } from 'vitest';
import { resolveMetricRows } from '@/components/tables/metricRows';

describe('resolveMetricRows', () => {
  it('reads labels, percentage rows and source from the config', () => {
    expect(
      resolveMetricRows({
        metrics: ['perc_household_ownership', 'perc_households_one_person'],
      })
    ).toEqual({
      rowHeaders: {
        perc_household_ownership:
          'Percentage of households where the property is owned outright',
        perc_households_one_person:
          'Percentage of one-person households where the person is aged 65 or over',
      },
      percentageRows: [
        'perc_household_ownership',
        'perc_households_one_person',
      ],
      currency: false,
      source: 'Census 2021 from the Office for National Statistics (ONS)',
    });
  });

  it('marks currency metrics', () => {
    expect(
      resolveMetricRows({ metrics: ['edpsr_stlt_total_all_ages'] }).currency
    ).toBe(true);
  });

  it('needs a source when the metrics come from different ones', () => {
    expect(() =>
      resolveMetricRows({
        metrics: ['perc_household_ownership', 'dementia_qof_prevalence'],
      })
    ).toThrow('different sources');
  });

  it('passes given rows straight through', () => {
    expect(
      resolveMetricRows({
        rowHeaders: { num_children_in_need_2024: '2023 to 2024' },
        source: 'DfE',
      })
    ).toEqual({
      rowHeaders: { num_children_in_need_2024: '2023 to 2024' },
      percentageRows: undefined,
      currency: undefined,
      source: 'DfE',
    });
  });
});
