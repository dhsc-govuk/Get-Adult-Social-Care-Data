import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import CategoryBreakdownTable from '@/components/tables/CategoryBreakdownTable';
import { BreakdownCategory } from '@/helpers/categoryBreakdown';
import { Indicator } from '@/data/interfaces/Indicator';

const categories: BreakdownCategory[] = [
  {
    label: 'Good',
    colour: '#1d70b8',
    countMetric: 'num_cqc_rating_good',
    percentageMetric: 'perc_cqc_rating_good',
  },
  {
    label: 'Inadequate',
    colour: '#d53880',
    countMetric: 'num_cqc_rating_inadequate',
    percentageMetric: 'perc_cqc_rating_inadequate',
  },
];

const total = {
  label: 'All locations',
  metric: 'num_cqc_rated_locations' as const,
};

const indicator = (
  metric_id: string,
  location_type: string,
  data_point: number | null
) =>
  ({
    metric_id,
    location_type,
    location_id: location_type,
    metric_date: '2024-04-01',
    data_point,
  }) as Indicator;

const data: Indicator[] = [
  indicator('num_cqc_rating_good', 'LA', 461),
  indicator('perc_cqc_rating_good', 'LA', 64.8),
  indicator('num_cqc_rating_good', 'ComparatorAverage', 4618),
  indicator('perc_cqc_rating_good', 'ComparatorAverage', 62.2),
  indicator('num_cqc_rating_good', 'Regional', 1200),
  indicator('perc_cqc_rating_good', 'Regional', 63.1),
  indicator('num_cqc_rating_good', 'National', 18195),
  indicator('perc_cqc_rating_good', 'National', 61.6),
  indicator('num_cqc_rating_inadequate', 'LA', 3),
  indicator('perc_cqc_rating_inadequate', 'LA', 0.4),
  indicator('num_cqc_rated_locations', 'LA', 711),
  indicator('num_cqc_rated_locations', 'ComparatorAverage', 7420),
  indicator('num_cqc_rated_locations', 'National', 29514),
];

const columnHeaders = {
  LALabel: 'Mid Suffolk',
  RegionLabel: 'East of England (regional total)',
  ComparatorLabel: 'NHS peer group total',
  CountryLabel: 'England (national)',
};

describe('CategoryBreakdownTable', () => {
  it('shows the count and percentage for each category, and the total', () => {
    render(
      <CategoryBreakdownTable
        caption="Table 1: CQC ratings"
        columnHeaders={columnHeaders}
        categoryColumnName="CQC rating"
        categories={categories}
        total={total}
        data={data}
      />
    );

    expect(
      screen.getByRole('table', { name: 'Table 1: CQC ratings' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual([
      'CQC rating',
      'Mid Suffolk',
      'NHS peer group total',
      'England (national)',
    ]);

    const good = screen.getByRole('row', { name: /Good/ });
    expect(
      within(good)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['461 (64.8%)', '4,618 (62.2%)', '18,195 (61.6%)']);

    const all = screen.getByRole('row', { name: /All locations/ });
    expect(
      within(all)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['711', '7,420', '29,514']);
  });

  it('shows a value the data does not have as unavailable', () => {
    render(
      <CategoryBreakdownTable
        columnHeaders={columnHeaders}
        categoryColumnName="CQC rating"
        categories={categories}
        total={total}
        data={data}
      />
    );

    const inadequate = screen.getByRole('row', { name: /Inadequate/ });
    expect(
      within(inadequate)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['3 (0.4%)', '--', '--']);
  });

  it('shows loading until any data arrives', () => {
    render(
      <CategoryBreakdownTable
        columnHeaders={columnHeaders}
        categoryColumnName="CQC rating"
        categories={categories}
        total={total}
        data={[]}
      />
    );

    expect(screen.getAllByText('Loading...')).toHaveLength(9);
  });

  it('shows the region in place of the comparison group when none is given', () => {
    render(
      <CategoryBreakdownTable
        columnHeaders={{ ...columnHeaders, ComparatorLabel: undefined }}
        categoryColumnName="CQC rating"
        categories={categories}
        total={total}
        data={data}
      />
    );

    expect(
      screen.getByRole('columnheader', {
        name: 'East of England (regional total)',
      })
    ).toBeInTheDocument();
    const good = screen.getByRole('row', { name: /Good/ });
    expect(within(good).getAllByRole('cell')[1].textContent).toBe(
      '1,200 (63.1%)'
    );
  });

  it("marks each row with its category's colour and names the source", () => {
    const { container } = render(
      <CategoryBreakdownTable
        columnHeaders={columnHeaders}
        categoryColumnName="CQC rating"
        categories={categories}
        total={total}
        data={data}
      />
    );

    const keys = container.querySelectorAll('.dhsc-category-key');
    expect(keys).toHaveLength(2);
    expect((keys[0] as HTMLElement).style.backgroundColor).toBe(
      'rgb(29, 112, 184)'
    );
    expect(
      screen.getByText('Source: Care Quality Commission (CQC)')
    ).toBeInTheDocument();
  });
});
