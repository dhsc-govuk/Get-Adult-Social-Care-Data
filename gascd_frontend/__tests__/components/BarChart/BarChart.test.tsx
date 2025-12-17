import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarChart from '@/components/charts/BarChart';
import React from 'react';

// Mock the Plotly component
// instead of rendering a real chart, we render a dummy div that holds the data in a data-testid
// which allows us to inspect the props passed to it.
vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: any[]; layout: any }) => (
    <div data-testid="plotly-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-layout">{JSON.stringify(layout)}</div>
    </div>
  ),
}));

describe('BarChart Component', () => {
  const mockCategories = ['England', 'Region', 'Suffolk', 'Norfolk'];
  const mockValues = [1000, 800, 600, 400];

  it('renders without crashing', () => {
    render(
      <BarChart
        categories={mockCategories}
        values={mockValues}
        highlightCategory="Suffolk"
      />
    );
    expect(screen.queryByTestId('plotly-mock')).toBeDefined();
  });

  it('applies correct colors based on highlightCategory and darkBlueCount', async () => {
    // We expect:
    // Index 0 (England): Dark Blue (Top 2 default)
    // Index 1 (Region): Dark Blue (Top 2 default)
    // Index 2 (Suffolk): Orange (Highlighted)
    // Index 3 (Norfolk): Purple (Standard)

    const COLOR_NAVY = '#12344D';
    const COLOR_ORANGE = '#F29F41';
    const COLOR_PURPLE = '#7670AC';

    render(
      <BarChart
        categories={mockCategories}
        values={mockValues}
        highlightCategory="Suffolk"
        darkBlueCount={2}
      />
    );

    // Retrieve the data prop from our mock
    const chart = await screen.findByTestId('chart-data');
    const dataString = chart.textContent;
    const data = JSON.parse(dataString || '[]');
    const trace = data[0];

    // Check colors
    expect(trace.marker.color[0]).toBe(COLOR_NAVY);
    expect(trace.marker.color[1]).toBe(COLOR_NAVY);
    expect(trace.marker.color[2]).toBe(COLOR_ORANGE);
    expect(trace.marker.color[3]).toBe(COLOR_PURPLE);
  });

  it('bolds the text for Highlighted and Top N categories', async () => {
    render(
      <BarChart
        categories={mockCategories}
        values={mockValues}
        highlightCategory="Suffolk"
        darkBlueCount={2}
      />
    );

    const chart = await screen.findByTestId('chart-data');
    const dataString = chart.textContent;
    const data = JSON.parse(dataString || '[]');
    const trace = data[0];

    expect(trace.y[0]).toBe('<b>England</b>'); // Top N
    expect(trace.y[2]).toBe('<b>Suffolk</b>'); // Highlight
    expect(trace.y[3]).toBe('Norfolk'); // Standard
  });

  it('generates the dotted box shape around the highlighted category', async () => {
    render(
      <BarChart
        categories={mockCategories}
        values={mockValues}
        highlightCategory="Suffolk" // Index 2
      />
    );

    const chart = await screen.findByTestId('chart-layout');
    const layoutString = chart.textContent;
    const layout = JSON.parse(layoutString || '{}');

    // Should be one shape
    expect(layout.shapes).toHaveLength(1);

    const box = layout.shapes[0];

    // "Suffolk" is at index 2. The box should be around 2 (1.5 to 2.5)
    expect(box.y0).toBe(1.5);
    expect(box.y1).toBe(2.5);
    expect(box.line.dash).toBe('dot');
  });

  it('does not crash or draw a box if the highlight category is missing', async () => {
    render(
      <BarChart
        categories={mockCategories}
        values={mockValues}
        highlightCategory="NonExistentPlace"
      />
    );

    const chart = await screen.findByTestId('chart-layout');
    const layoutString = chart.textContent;
    const layout = JSON.parse(layoutString || '{}');

    // Shapes array should be empty
    expect(layout.shapes).toHaveLength(0);
  });
});
