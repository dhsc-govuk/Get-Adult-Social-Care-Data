import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import React from 'react';

vi.mock('react-plotly.js', () => ({
  default: ({ data }: { data: any[] }) => (
    <div data-testid="chart-data">{JSON.stringify(data)}</div>
  ),
}));

describe('GroupedBarChart', () => {
  const categories = ['Age 14', 'Age 15'];
  const series = [
    { name: 'Test LA 1', values: [10, 12] },
    {
      name: 'Test Region 1 (regional average)',
      values: [8, 9],
      comparator: true,
    },
  ];

  it('renders one grouped bar trace per series', async () => {
    render(<GroupedBarChart categories={categories} series={series} />);

    // Plotly is loaded dynamically, so the first render has to be awaited
    const chartData = await screen.findByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '[]');

    expect(data).toHaveLength(2);
    expect(data[0].type).toBe('bar');
    expect(data[0].x).toEqual(categories);
    expect(data[0].y).toEqual([10, 12]);
  });

  it('fills the LA bars and outlines comparator bars in the same colour', () => {
    render(<GroupedBarChart categories={categories} series={series} />);

    const data = JSON.parse(
      screen.getByTestId('chart-data').textContent || '[]'
    );

    expect(data[0].marker.line).toBeUndefined();
    expect(data[1].marker.color).toBe('#ffffff');
    expect(data[1].marker.line.color).not.toBe('#ffffff');
    expect(data[1].marker.line.width).toBeGreaterThan(0);
  });
});
