import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CategoryBreakdownSection from '@/components/data-components/CategoryBreakdownSection';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { CQC_RATING_CATEGORIES } from '@/data/cqcMetrics';
import { Indicator } from '@/data/interfaces/Indicator';

vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plotly-mock" />,
}));

const indicator = (
  metric_id: string,
  location_type: string,
  data_point: number
) =>
  ({
    metric_id,
    location_type,
    location_id: location_type,
    metric_date: '2024-04-01',
    data_point,
  }) as Indicator;

const data = [
  indicator('num_cqc_rating_good', 'LA', 461),
  indicator('perc_cqc_rating_good', 'LA', 64.8),
  indicator('num_cqc_rated_locations', 'LA', 711),
  indicator('num_cqc_rated_locations', 'National', 29514),
];

const comparator = {
  groups: [],
  selection: { kind: 'nhs_peer_group' },
  comparatorLabel: undefined,
  comparatorAverageLabel: 'NHS peer group (average)',
  comparatorTotalLabel: 'NHS peer group total',
  renderComparatorControl: (idPrefix: string) => <p>comparator {idPrefix}</p>,
} as unknown as ComparatorControls;

const renderSection = (props: { loading?: boolean; error?: boolean } = {}) =>
  render(
    <CategoryBreakdownSection
      id="4"
      title="CQC ratings of inspected adult social care locations"
      intro={<p>Find out how</p>}
      categoryColumnName="CQC rating"
      categories={CQC_RATING_CATEGORIES}
      total={{ label: 'All locations', metric: 'num_cqc_rated_locations' }}
      data={data}
      columnHeaders={{
        LALabel: 'Mid Suffolk',
        RegionLabel: 'East of England (regional total)',
        ComparatorLabel: 'NHS peer group total',
        CountryLabel: 'England (national)',
      }}
      bars={[
        { label: 'Mid Suffolk', locationType: 'LA' },
        { label: 'NHS peer group total', locationType: 'ComparatorAverage' },
        { label: 'England (national)', locationType: 'National' },
      ]}
      laName="Mid Suffolk"
      figureNumber={1}
      figureTitle="number and percentage of adult social care locations by CQC rating"
      comparisonSummary="Mid Suffolk LA, NHS peer group total and England (national), 1 April 2024"
      tableCaption="Table 1: CQC ratings"
      download={{
        filename: 'cqc_ratings.csv',
        description: 'CQC ratings of adult social care locations',
      }}
      comparator={comparator}
      loading={props.loading ?? false}
      error={props.error ?? false}
    />
  );

describe('CategoryBreakdownSection', () => {
  it('shows the title, intro and NHS peer group explanation', () => {
    renderSection();
    expect(
      screen.getByRole('heading', {
        name: 'CQC ratings of inspected adult social care locations',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Find out how')).toBeInTheDocument();
    expect(
      screen.getByText('Interpreting the NHS Peer Group')
    ).toBeInTheDocument();
  });

  it('orders the tabs table, chart, download, with the table selected', () => {
    renderSection();
    const tabs = screen
      .getAllByRole('link', { name: /^(Table|Chart|Download)$/ })
      .map((tab) => tab.textContent);
    expect(tabs).toEqual(['Table', 'Chart', 'Download']);
    expect(screen.getByText('Table').closest('li')).toHaveClass(
      'govuk-tabs__list-item--selected'
    );
  });

  it("puts the comparison group in each tab, with the section's ids", () => {
    renderSection();
    for (const tab of ['table', 'chart', 'download']) {
      expect(
        screen.getByText(`comparator comparator-${tab}-4`)
      ).toBeInTheDocument();
    }
  });

  it('labels the table, the figure and the download', () => {
    renderSection();
    expect(
      screen.getByRole('table', { name: 'Table 1: CQC ratings' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Figure 1: number and percentage of adult social care locations by CQC rating – Mid Suffolk LA/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /This chart compares Mid Suffolk with its NHS Peer Group and England/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Export CQC ratings of adult social care locations table data (CSV)',
      })
    ).toBeInTheDocument();
  });

  it('tells the reader to hover and names the source under the chart', () => {
    renderSection();
    expect(
      screen.getByText(
        'Hover over or select each bar to see the exact number and percentage.'
      )
    ).toBeInTheDocument();
    // Once under the table and once under the chart
    expect(
      screen.getAllByText('Source: Care Quality Commission (CQC)')
    ).toHaveLength(2);
  });

  it('draws the chart once the data has arrived', async () => {
    renderSection();
    expect(await screen.findByTestId('plotly-mock')).toBeInTheDocument();
    expect(screen.queryByText('Data not available')).not.toBeInTheDocument();
  });

  it('shows loading, then unavailable, in place of the chart', () => {
    const { unmount } = renderSection({ loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('plotly-mock')).not.toBeInTheDocument();
    unmount();

    renderSection({ error: true });
    expect(screen.getByText('Data not available')).toBeInTheDocument();
    expect(screen.queryByTestId('plotly-mock')).not.toBeInTheDocument();
  });

  it('labels the data as published', () => {
    renderSection();
    screen.getAllByTestId('sharing-label').forEach((label) => {
      expect(label.textContent).toContain('Published data');
    });
  });
});
