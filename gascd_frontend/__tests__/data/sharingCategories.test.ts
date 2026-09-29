import {
  DEFAULT_SHARING_CATEGORY_ID,
  METRIC_SHARING_CATEGORIES,
  SHARING_CATEGORIES,
  getSharingCategoryForMetric,
  getSharingCsvNotice,
  resolveSharingCategory,
} from '@/data/sharingCategories';

describe('sharing categories', () => {
  it('defines the three agreed labels and statements', () => {
    expect(SHARING_CATEGORIES.published.label).toBe('Published data');
    expect(SHARING_CATEGORIES.published.statement).toBe(
      'This data can be shared outside your organisation.'
    );

    expect(SHARING_CATEGORIES['not-for-external-sharing'].label).toBe(
      'Not for sharing externally'
    );
    expect(SHARING_CATEGORIES['not-for-external-sharing'].statement).toBe(
      'The data in the chart is not to be shared outside your organisation.'
    );

    expect(SHARING_CATEGORIES.discretion.label).toBe(
      'Share at your own discretion'
    );
    expect(SHARING_CATEGORIES.discretion.statement).toBe(
      'You can only share data externally where it was provided by your organisation.'
    );
  });

  it('only shows a warning icon on the two higher severity labels', () => {
    expect(SHARING_CATEGORIES.published.showWarningIcon).toBe(false);
    expect(SHARING_CATEGORIES.discretion.showWarningIcon).toBe(true);
    expect(SHARING_CATEGORIES['not-for-external-sharing'].showWarningIcon).toBe(
      true
    );
  });

  it('only carries the outward facing AI note on "not for sharing externally"', () => {
    expect(
      SHARING_CATEGORIES['not-for-external-sharing'].additionalSourceNote
    ).toContain('AI tools that are outwards facing');
    expect(SHARING_CATEGORIES.published.additionalSourceNote).toBeUndefined();
    expect(SHARING_CATEGORIES.discretion.additionalSourceNote).toBeUndefined();
  });
});

describe('getSharingCategoryForMetric', () => {
  it('returns the categorisation held against the metric', () => {
    expect(getSharingCategoryForMetric('total_population').id).toBe(
      'published'
    );
    expect(
      getSharingCategoryForMetric(
        'bedcount_per_hundred_thousand_adults_general_nursing'
      ).id
    ).toBe('not-for-external-sharing');
    expect(getSharingCategoryForMetric('nccc_num_clients_comm_care').id).toBe(
      'discretion'
    );
  });

  it('inherits the category of the base metric for derived series', () => {
    expect(
      getSharingCategoryForMetric('pansi_pred_pop_asd_aged_18_64_yearly').id
    ).toBe('not-for-external-sharing');
    expect(
      getSharingCategoryForMetric(
        'pansi_pred_pop_early_dem_aged_30_64_perc_change_yearly'
      ).id
    ).toBe('not-for-external-sharing');
  });

  it('falls back to the most restrictive category for an unknown metric', () => {
    expect(getSharingCategoryForMetric('not_a_real_metric').id).toBe(
      DEFAULT_SHARING_CATEGORY_ID
    );
    expect(DEFAULT_SHARING_CATEGORY_ID).toBe('not-for-external-sharing');
  });
});

describe('resolveSharingCategory', () => {
  it('returns nothing when no metrics are given', () => {
    expect(resolveSharingCategory(undefined)).toBeUndefined();
    expect(resolveSharingCategory([])).toBeUndefined();
  });

  it('returns the shared category when all metrics agree', () => {
    expect(
      resolveSharingCategory(['total_population', 'perc_65over'])?.id
    ).toBe('published');
  });

  it('returns the most restrictive category for a mixed set of metrics', () => {
    expect(
      resolveSharingCategory([
        'bedcount_total',
        'median_bed_count_total',
        'median_occupancy_total',
      ])?.id
    ).toBe('not-for-external-sharing');

    expect(
      resolveSharingCategory(['total_population', 'nccc_num_clients_comm_care'])
        ?.id
    ).toBe('discretion');
  });
});

describe('getSharingCsvNotice', () => {
  it('returns nothing when there is no category', () => {
    expect(getSharingCsvNotice(undefined)).toEqual([]);
  });

  it('carries the label and statement for published data', () => {
    expect(getSharingCsvNotice(SHARING_CATEGORIES.published)).toEqual([
      'Sharing label: Published data',
      'This data can be shared outside your organisation.',
    ]);
  });

  it('carries the additional source note for restricted data', () => {
    const notice = getSharingCsvNotice(
      SHARING_CATEGORIES['not-for-external-sharing']
    );
    expect(notice[0]).toBe('Sharing label: Not for sharing externally');
    expect(notice[1]).toBe(
      'The data in the chart is not to be shared outside your organisation.'
    );
    expect(notice[2]).toContain('AI tools that are outwards facing');
  });
});

describe('metric categorisation', () => {
  it('only uses the three agreed categories', () => {
    const allowed = Object.keys(SHARING_CATEGORIES);
    Object.entries(METRIC_SHARING_CATEGORIES).forEach(([metricId, id]) => {
      expect(allowed, `unexpected category for ${metricId}`).toContain(id);
    });
  });
});
