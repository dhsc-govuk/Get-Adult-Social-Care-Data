import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import React from 'react';

// Mock Plotly
vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: any[]; layout: any }) => (
    <div data-testid="plotly-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-layout">{JSON.stringify(layout)}</div>
    </div>
  ),
}));

describe('TimeSeriesChart Component', () => {
  const mockSeries = [
    {
      name: 'Series A',
      data: [
        { date: '2024-01-01', value: 10 },
        { date: '2024-01-02', value: 20 },
      ],
    },
    {
      name: 'Series B',
      data: [
        { date: '2024-01-01', value: 5 },
        { date: '2024-01-02', value: 15 },
      ],
    },
  ];

  it('renders one trace per series', async () => {
    render(<TimeSeriesChart series={mockSeries} />);

    const chartdata = await screen.findByTestId('chart-data');
    const dataString = chartdata?.textContent;
    const data = JSON.parse(dataString || '[]');

    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('Series A');
    expect(data[1].name).toBe('Series B');
  });

  it('correctly maps date and value to x and y', () => {
    render(<TimeSeriesChart series={mockSeries} />);

    const dataString = screen.getByTestId('chart-data').textContent;
    const data = JSON.parse(dataString || '[]');
    const traceA = data[0];

    // Check X mapping
    expect(traceA.x).toEqual(['2024-01-01', '2024-01-02']);
    // Check Y mapping
    expect(traceA.y).toEqual([10, 20]);
  });

  it('configures layout with vertical legend and correct grid settings', () => {
    render(<TimeSeriesChart series={mockSeries} />);

    const layoutString = screen.getByTestId('chart-layout').textContent;
    const layout = JSON.parse(layoutString || '{}');

    // Verify Legend (Top vertical)
    expect(layout.legend.orientation).toBe('v');
    expect(layout.legend.y).toBeGreaterThan(1);

    // Verify Grid (Only Y axis has grid lines)
    expect(layout.xaxis.showgrid).toBe(false);
    expect(layout.yaxis.showgrid).toBe(true);
  });
});
