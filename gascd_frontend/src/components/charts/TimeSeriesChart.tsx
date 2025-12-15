'use client'
import React, { useMemo } from 'react';
import { Layout, Data, ScatterData } from 'plotly.js';
import dynamic from 'next/dynamic';

// Skip any SSR compilation for plotly
const Plotly = dynamic(() => import('react-plotly.js'), { ssr: false });

// --- Types ---

export interface DataPoint {
  date: string; // ISO date string (e.g., '2025-01-01')
  value: number;
}

export interface Series {
  name: string;
  data: DataPoint[];
  color?: string; 
}

interface TimeSeriesChartProps {
  series: Series[];
}

// --- Component ---

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  series = [], 
}) => {

  const DEFAULT_COLORS = [
    "#F29F41", // Orange 
    "#12344D", // Dark Navy 
    "#56B4E9", // Light Blue
    "#009E73", // Green (Extra)
    "#CC79A7"  // Pink (Extra)
  ];

  // 1. Transform props into Plotly Data Traces
  const chartData: Data[] = useMemo(() => {
    return series.map((s, index) => {
      // Create separate arrays for X and Y as Plotly expects
      const xValues = s.data.map(d => d.date);
      const yValues = s.data.map(d => d.value);
      
      const trace: Partial<ScatterData> = {
        type: 'scatter',
        mode: 'lines',
        name: s.name,
        x: xValues,
        y: yValues,
        line: {
          // Use provided color or fallback to the palette
          color: s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          width: 5,
        },
        hovertemplate: '<b>%{y:,.0f}</b><br>%{x|%d %b %Y}<extra></extra>', 
      };

      return trace as Data;
    });
  }, [series]);

  const layout: Partial<Layout> = {
    // Legend positioned above the chart, horizontal
    legend: {
      orientation: 'v',
      yanchor: 'bottom',
      y: 1.05, // Push slightly above the plot area
      xanchor: 'left',
      x: 0,
      font: {
        family: '"GDS Transport", Arial, sans-serif',
        size: 20,
        color: '#000',
      },
    },
    xaxis: {
      type: 'date',
      tickformat: '%b %y', // Shows "Jan", "Feb", etc.
      showgrid: false,  // No vertical grid lines
      tickfont: { 
        family: '"GDS Transport", Arial, sans-serif',
        size: 14, color: '#000' 
      },
      fixedrange: true, // prevents zooming
    },
    yaxis: {
      showgrid: true,   // Keep horizontal grid lines
      gridcolor: '#e1e1e1',
      zeroline: true,  // We use the X-axis zeroline instead
      zerolinecolor: '#333',
      zerolinewidth: 2,
      tickfont: { 
        family: '"GDS Transport", Arial, sans-serif',
        size: 14, color: '#000' 
      },
      rangemode: 'tozero', // Ensures 0 is always visible
      fixedrange: true, // prevents zooming
      automargin: true,
    },
    margin: { l: 60, t: 50, r: 20, b: 50 }, // Adjust margins for axis labels
    hovermode: 'x unified', // Shows all values for a specific month on hover
    autosize: true,
  };

  return (
    <Plotly
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
      data={chartData}
      layout={layout}
      config={{ displayModeBar: false }}
    />
  );
};

export default TimeSeriesChart;