import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StackedBarChart from '@/components/charts/StackedBarChart';
import React from 'react';

// Mock the Plotly component: instead of rendering a real chart, render a
// dummy div that holds the props so they can be inspected
vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: any[]; layout: any }) => (
    <div data-testid="plotly-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-layout">{JSON.stringify(layout)}</div>
    </div>
  ),
}));

describe('StackedBarChart', () => {
  const categories = ['Sunderland', 'NHS peer group total', 'England'];
  const segments = [
    {
      name: 'Good',
      color: '#1d70b8',
      values: [64.8, 62.2, 61.6],
      counts: [461, 4618, 18195],
    },
    {
      name: 'Inadequate',
      color: '#d53880',
      values: [0.4, 0.3, 0.4],
      counts: [3, 20, 124],
    },
  ];

  const chartData = async () => {
    // Plotly is loaded dynamically, so the first render has to be awaited
    const chart = await screen.findByTestId('chart-data');
    return JSON.parse(chart.textContent || '[]');
  };

  it('renders one stacked horizontal bar trace per segment, in the segment colour', async () => {
    render(<StackedBarChart categories={categories} segments={segments} />);

    const data = await chartData();
    expect(data).toHaveLength(2);
    expect(data[0].type).toBe('bar');
    expect(data[0].orientation).toBe('h');
    expect(data[0].name).toBe('Good');
    expect(data[0].x).toEqual([64.8, 62.2, 61.6]);
    expect(data[0].y).toEqual(categories);
    expect(data[0].marker.color).toBe('#1d70b8');
    expect(data[1].marker.color).toBe('#d53880');

    const layout = JSON.parse(
      screen.getByTestId('chart-layout').textContent || '{}'
    );
    expect(layout.barmode).toBe('stack');
    expect(layout.xaxis.range).toEqual([0, 100]);
    expect(layout.xaxis.ticksuffix).toBe('%');
    expect(layout.showlegend).toBe(false);
  });

  it('shows the segment name, percentage and formatted count on hover', async () => {
    render(<StackedBarChart categories={categories} segments={segments} />);

    const data = await chartData();
    expect(data[0].customdata).toEqual(['461', '4,618', '18,195']);
    expect(data[0].hovertemplate).toBe(
      '<b>Good</b><br>%{x:.1f}%<br>(%{customdata})<extra></extra>'
    );
  });

  it('shows a missing count as N/A, and omits it when no counts are given', async () => {
    render(
      <StackedBarChart
        categories={['Sunderland']}
        segments={[
          { name: 'Good', color: '#1d70b8', values: [50], counts: [null] },
          { name: 'Inadequate', color: '#d53880', values: [50] },
        ]}
      />
    );

    const data = await chartData();
    expect(data[0].customdata).toEqual(['N/A']);
    expect(data[1].customdata).toBeUndefined();
    expect(data[1].hovertemplate).toBe(
      '<b>Inadequate</b><br>%{x:.1f}%<extra></extra>'
    );
  });

  it('bolds the highlighted bar label', async () => {
    render(
      <StackedBarChart
        categories={categories}
        segments={segments}
        highlightCategory="Sunderland"
      />
    );

    const data = await chartData();
    expect(data[0].y).toEqual([
      '<b>Sunderland</b>',
      'NHS peer group total',
      'England',
    ]);
  });

  it('lists every segment in an HTML legend', () => {
    render(<StackedBarChart categories={categories} segments={segments} />);

    const legendItems = screen.getAllByRole('listitem');
    expect(legendItems.map((item) => item.textContent)).toEqual([
      'Good',
      'Inadequate',
    ]);
  });
});
