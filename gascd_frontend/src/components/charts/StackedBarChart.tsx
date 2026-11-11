'use client';
import React, { useMemo } from 'react';
import { Layout, Data, PlotData } from 'plotly.js';
import dynamic from 'next/dynamic';
import { usePlotlyResize } from './usePlotlyResize';
import TableService from '@/services/Table/TableService';

// Skip any SSR compilation for plotly
const Plotly = dynamic(() => import('react-plotly.js'), { ssr: false });

export interface StackedBarSegment {
  name: string;
  color: string;
  /** One value per bar: the share of the bar this segment takes, in percent */
  values: (number | null)[];
  /** The count behind each value, shown on hover beside the percentage */
  counts?: (number | null)[];
}

interface StackedBarChartProps {
  /** The bars, for example the user's LA, their comparison group and England */
  categories: string[];
  /** The segments of each bar, in the order they are stacked */
  segments: StackedBarSegment[];
  /** Shown in bold, for example the user's own LA */
  highlightCategory?: string;
  /** The height of the plot area in pixels, below the legend */
  height?: number;
}

/**
 * Horizontal 100% stacked bar chart comparing how a whole is split between
 * categories across several bars, used where a count is broken down (the CQC
 * ratings of locations, say) for the user's LA, their comparison group and
 * England. `BarChart` covers the single series case and `GroupedBarChart`
 * compares the same categories side by side instead.
 *
 * The legend is drawn in HTML above the chart, as the peer group charts do,
 * so it is read by assistive technology and wraps with the page.
 */
const StackedBarChart: React.FC<StackedBarChartProps> = ({
  categories = [],
  segments = [],
  highlightCategory,
  height = 300,
}) => {
  const { containerRef, onGraphReady } = usePlotlyResize();

  const formattedLabels = useMemo(
    () =>
      categories.map((category) =>
        category === highlightCategory ? `<b>${category}</b>` : category
      ),
    [categories, highlightCategory]
  );

  const chartData: Data[] = useMemo(
    () =>
      segments.map((segment) => {
        const counts = segment.counts?.map((count) =>
          count === null ? 'N/A' : TableService.formatDataPoint(count)
        );
        const trace: Partial<PlotData> = {
          type: 'bar',
          orientation: 'h',
          name: segment.name,
          x: segment.values,
          y: formattedLabels,
          marker: { color: segment.color },
          ...(counts && { customdata: counts }),
          // The rating hovered, its share of the bar and the count behind it
          hovertemplate: counts
            ? `<b>${segment.name}</b><br>%{x:.1f}%<br>(%{customdata})<extra></extra>`
            : `<b>${segment.name}</b><br>%{x:.1f}%<extra></extra>`,
        };
        return trace as Data;
      }),
    [segments, formattedLabels]
  );

  const layout: Partial<Layout> = {
    barmode: 'stack',
    bargap: 0.4,
    font: {
      family: '"GDS Transport", Arial, sans-serif',
      size: 16,
      color: '#000',
    },
    xaxis: {
      // The segments of a bar add up to the whole
      range: [0, 100],
      dtick: 20,
      ticksuffix: '%',
      showgrid: true,
      gridcolor: '#e1e1e1',
      zeroline: false,
      fixedrange: true, // prevents zooming
    },
    yaxis: {
      autorange: 'reversed', // first bar at the top
      ticks: 'outside', // hack to push labels away from the axis
      ticklen: 15,
      tickcolor: 'rgba(0,0,0,0)', // Make the actual tick line invisible/transparent
      fixedrange: true, // prevents zooming
      automargin: true, // make space for long labels.
    },
    hoverlabel: {
      // One dark box whichever segment is hovered, so the text stays legible
      // against the paler rating colours
      bgcolor: '#0b0c0c',
      bordercolor: '#0b0c0c',
      font: {
        size: 16,
        family: '"GDS Transport", Arial, sans-serif',
        color: '#ffffff',
      },
    },
    margin: { l: 150, t: 20, r: 20, b: 50 },
    showlegend: false,
    autosize: true,
  };

  return (
    <div>
      <ul
        className="govuk-list govuk-!-margin-bottom-4"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: 0,
        }}
      >
        {segments.map((segment) => (
          <li
            key={segment.name}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                background: segment.color,
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span className="govuk-body-s govuk-!-margin-bottom-0">
              {segment.name}
            </span>
          </li>
        ))}
      </ul>
      <div ref={containerRef} style={{ width: '100%', height: `${height}px` }}>
        <Plotly
          onInitialized={onGraphReady}
          onUpdate={onGraphReady}
          style={{ width: '100%', height: '100%' }}
          data={chartData}
          layout={layout}
          useResizeHandler={true}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </div>
  );
};

export default StackedBarChart;
