'use client';
import React, { useMemo } from 'react';
import { Layout, Data, PlotData } from 'plotly.js';
import dynamic from 'next/dynamic';

// Skip any SSR compilation for plotly
const Plotly = dynamic(() => import('react-plotly.js'), { ssr: false });

export interface BarSeries {
  name: string;
  /** One value per category, in the same order as `categories` */
  values: (number | null)[];
  color?: string;
}

interface GroupedBarChartProps {
  /** Shared x axis categories, for example the age bands */
  categories: string[];
  series: BarSeries[];
  yPrefix?: string;
  ySuffix?: string;
  decimalPoints?: number;
}

/**
 * Vertical bar chart comparing the same categories across several series, used
 * where a metric is broken down by age for the user's LA, their region and
 * England. `BarChart` covers the single series, horizontal case instead.
 */
const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  categories = [],
  series = [],
  yPrefix = '',
  ySuffix = '',
  decimalPoints = 0,
}) => {
  const DEFAULT_COLORS = [
    // Colour palette from
    // https://service-manual.ons.gov.uk/data-visualisation/colours/using-colours-in-charts#multiple-colours
    '#206095',
    '#a8bd3a',
    '#871a5b',
    '#f66068',
    '#05341a',
    '#27a0cc',
  ];

  const chartData: Data[] = useMemo(
    () =>
      series.map((s, index) => {
        const trace: Partial<PlotData> = {
          type: 'bar',
          name: s.name,
          x: categories,
          y: s.values,
          marker: {
            color: s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          },
          hovertemplate: `<b>${s.name}</b><br>%{x}: ${yPrefix}%{y:,.${decimalPoints}f}${ySuffix}<extra></extra>`,
        };
        return trace as Data;
      }),
    [categories, series, yPrefix, ySuffix, decimalPoints]
  );

  const layout: Partial<Layout> = {
    barmode: 'group',
    bargap: 0.3,
    bargroupgap: 0.05,
    showlegend: true,
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.05,
      xanchor: 'left',
      x: 0,
      font: {
        family: '"GDS Transport", Arial, sans-serif',
        size: 16,
        color: '#000',
      },
    },
    xaxis: {
      type: 'category',
      showgrid: false,
      fixedrange: true, // prevents zooming
      tickfont: {
        family: '"GDS Transport", Arial, sans-serif',
        size: 14,
        color: '#000',
      },
    },
    yaxis: {
      showgrid: true,
      gridcolor: '#e1e1e1',
      zeroline: true,
      zerolinecolor: '#333',
      zerolinewidth: 2,
      rangemode: 'tozero',
      fixedrange: true, // prevents zooming
      automargin: true,
      tickprefix: yPrefix,
      ticksuffix: ySuffix,
      tickfont: {
        family: '"GDS Transport", Arial, sans-serif',
        size: 14,
        color: '#000',
      },
    },
    hoverlabel: {
      font: {
        size: 16,
        family: '"GDS Transport", Arial, sans-serif',
        color: '#ffffff',
      },
    },
    margin: { l: 60, t: 50, r: 20, b: 50 },
    autosize: true,
  };

  return (
    <Plotly
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
      data={chartData}
      layout={layout}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
};

export default GroupedBarChart;
