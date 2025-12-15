'use client';
import React, { useMemo } from 'react';
import { Layout, Data, Shape } from 'plotly.js';
import dynamic from 'next/dynamic';

// Skip any SSR compilation for plotly
const Plotly = dynamic(() => import('react-plotly.js'), { ssr: false });

interface BarChartProps {
  categories: string[];
  values: number[];
  highlightCategory: string;
  darkBlueCount?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  categories = [],
  values = [],
  highlightCategory,
  darkBlueCount = 2,
}) => {
  // Top highlight colours
  const TOP_HIGHLIGHT_COL = '#12344D';
  // Main highlight row
  const MAIN_HIGHLIGHT_COL = '#F29F41';
  // All other rows
  const DEFAULT_ROW_COL = '#7670AC';

  // Map row colours
  const { barColors, formattedLabels } = useMemo(() => {
    const colors: string[] = [];
    const labels: string[] = [];

    categories.forEach((cat, index) => {
      if (cat === highlightCategory) {
        colors.push(MAIN_HIGHLIGHT_COL);
        labels.push(`<b>${cat}</b>`);
      } else if (index < darkBlueCount) {
        colors.push(TOP_HIGHLIGHT_COL);
        labels.push(`<b>${cat}</b>`);
      } else {
        colors.push(DEFAULT_ROW_COL);
        labels.push(cat);
      }
    });

    return { barColors: colors, formattedLabels: labels };
  }, [categories, highlightCategory, darkBlueCount]);

  // Dotted box for the main highlight
  const shapes = useMemo((): Partial<Shape>[] => {
    const highlightIndex = categories.indexOf(highlightCategory);

    if (highlightIndex === -1) return [];

    return [
      {
        type: 'rect',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: highlightIndex - 0.5,
        y1: highlightIndex + 0.5,
        line: {
          color: 'black',
          width: 2,
          dash: 'dot',
        },
      },
    ];
  }, [categories, highlightCategory]);

  // Pull together the labels and values, along with some hover text
  const chartData: Data[] = [
    {
      type: 'bar',
      x: values,
      y: formattedLabels,
      orientation: 'h',
      marker: {
        color: barColors,
      },
      hovertemplate: '<b>%{y}</b><br>Value: %{x}<extra></extra>',
    },
  ];

  const layout: Partial<Layout> = {
    font: {
      family: '"GDS Transport", Arial, sans-serif',
      size: 20,
      color: '#000',
    },
    xaxis: {
      side: 'top',
      zeroline: true,
      fixedrange: true, // prevents zooming
    },
    yaxis: {
      autorange: 'reversed',
      ticks: 'outside', // hack to push labels away from the axis
      ticklen: 15,
      tickcolor: 'rgba(0,0,0,0)', // Make the actual tick line invisible/transparent
      fixedrange: true, // prevents zooming
      automargin: true, // make space for long labels.
    },
    bargap: 0.4,
    hoverlabel: {
      font: {
        size: 18, // Increase this number to make the text larger
        family: '"GDS Transport", Arial, sans-serif',
      },
    },
    shapes: shapes,
    margin: { l: 200, t: 50, r: 20, b: 20 }, // minimum margin buffer
    showlegend: false,
    autosize: true,
  };

  return (
    <Plotly
      style={{ width: '100%', height: '100%' }}
      data={chartData}
      layout={layout}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
};

export default BarChart;
