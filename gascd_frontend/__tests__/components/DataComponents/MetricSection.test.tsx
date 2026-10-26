import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MetricSection from '@/components/data-components/MetricSection';
import { ComparatorControls } from '@/components/charts/peer-group/useComparatorControls';
import { Indicator } from '@/data/interfaces/Indicator';

vi.mock('react-plotly.js', () => ({ default: () => <div /> }));

const indicator = (location_type: string, data_point: number) =>
  ({
    metric_id: 'perc_unpaid_care_provider',
    location_type,
    location_id: location_type,
    metric_date: '2021',
    data_point,
  }) as Indicator;

const comparator = {
  groups: [],
  selection: { kind: 'nhs_peer_group' },
  comparatorLabel: undefined,
  comparatorAverageLabel: 'NHS peer group (average)',
  renderComparatorControl: (idPrefix: string) => <p>comparator {idPrefix}</p>,
} as unknown as ComparatorControls;

const renderSection = () =>
  render(
    <MetricSection
      id="7"
      title="Unpaid care"
      metric="perc_unpaid_care_provider"
      intro={<p>Find out how</p>}
      figureNumber={2}
      metricDescription="unpaid care"
      tableCaption="Table 3: unpaid care"
      columnHeaders={{
        LALabel: 'Sunderland',
        RegionLabel: 'North East',
        ComparatorLabel: 'NHS peer group (average)',
        CountryLabel: 'England',
      }}
      download={{ filename: 'unpaid.csv', description: 'unpaid care' }}
      data={[
        indicator('LA', 10),
        indicator('Regional', 20),
        indicator('National', 30),
      ]}
      laCode="E08000024"
      laName="Sunderland"
      regionLabel="North East"
      comparator={comparator}
      peer={{ dataByMetric: {}, loading: false, error: false }}
    />
  );

describe('MetricSection', () => {
  it('shows the title, intro and NHS peer group explanation', () => {
    renderSection();
    expect(screen.getByText('Unpaid care')).toBeInTheDocument();
    expect(screen.getByText('Find out how')).toBeInTheDocument();
    expect(
      screen.getByText('Interpreting the NHS Peer Group')
    ).toBeInTheDocument();
  });

  it("puts the comparison group in each tab, with the section's ids", () => {
    renderSection();
    for (const tab of ['chart', 'table', 'download']) {
      expect(
        screen.getByText(`comparator comparator-${tab}-7`)
      ).toBeInTheDocument();
    }
  });

  it("titles the figure with the metric's label and labels the table rows", () => {
    renderSection();
    expect(
      screen.getByText(
        /Figure 2: Percentage of people aged 5 or over who provide unpaid care/
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Table 3: unpaid care')).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', {
        name: 'Percentage of people aged 5 or over who provide unpaid care',
      })
    ).toBeInTheDocument();
  });
});
