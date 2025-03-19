import * as d3 from 'd3';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { LinegraphData } from '@/data/interfaces/LinegraphData';
import { Locations } from '@/data/interfaces/Locations';

export function initializeSvg(
  ref: React.RefObject<SVGSVGElement>,
  width: number,
  height: number
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const svg = d3
    .select(ref.current)
    .attr('width', width)
    .attr('height', height);

  svg.selectAll('*').remove();

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

  return svg.append('g');
}

export function truncateLabels(label: string, maxLength: number): string {
  if (label.length > maxLength) {
    return label.substring(0, maxLength) + '...';
  }
  return label;
}

function getMetricColorScale(
  metrics: string[]
): d3.ScaleOrdinal<string, string> {
  return d3.scaleOrdinal<string, string>().domain(metrics).range(d3.schemeSet1);
}

export function createXAxisScale(
  data: BarchartData[],
  width: number,
  margin: { top: number; right: number; bottom: number; left: number }
): d3.ScaleBand<string> {
  return d3
    .scaleBand()
    .domain(data.map((dataItem) => dataItem.valueTag))
    .range([margin.left, width - margin.right])
    .padding(0.1);
}

export function createYAxisScale(
  data: BarchartData[],
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): d3.ScaleLinear<number, number> {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, (dataItem) => Number(dataItem.value)) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top]);
}

export function createBarXAxisScale(
  data: BarchartData[],
  width: number,
  margin: { top: number; right: number; bottom: number; left: number }
): d3.ScaleLinear<number, number> {
  return d3
    .scaleLinear()
    .domain([0, d3.max(data, (dataItem) => Number(dataItem.value)) ?? 0])
    .nice()
    .range([margin.left, width - margin.right]);
}

export function createBarYAxisScale(
  data: BarchartData[],
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): d3.ScaleBand<string> {
  return d3
    .scaleBand()
    .domain(data.map((dataItem) => dataItem.valueTag))
    .range([height - margin.bottom, margin.top])
    .padding(0.1);
}

export function calculateQuartiles(data: BarchartData[]) {
  const sortedData = data.map((d) => d.value).sort((a, b) => a - b);

  const median = d3.median(sortedData);
  const q1 = d3.quantile(sortedData, 0.25);
  const q3 = d3.quantile(sortedData, 0.75);

  return {
    median,
    quartiles: {
      Q1: q1 ?? 0,
      Q2: median ?? 0,
      Q3: q3 ?? 0,
    },
  };
}

export function renderBars(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: BarchartData[],
  xAxisScale: d3.ScaleLinear<number, number>,
  yAxisScale: d3.ScaleBand<string>,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  const uniqueMetrics = [...new Set(data.map((d) => d.metric))];

  const metricScale = d3
    .scaleBand()
    .domain(uniqueMetrics)
    .range([0, yAxisScale.bandwidth()])
    .padding(0.1);

  const barGroups = chartSvg
    .selectAll<SVGGElement, BarchartData>('.bar-group')
    .data(data, (d: BarchartData) => `${d.valueTag}-${d.metric}`);

  const barEnter = barGroups.enter().append('g').attr('class', 'bar-group');

  barEnter
    .append('rect')
    .attr(
      'y',
      (d) => (yAxisScale(d.valueTag) ?? 0) + (metricScale(d.metric) ?? 0) + 5
    )
    .attr('x', margin.left)
    .attr('height', metricScale.bandwidth() - 10)
    .attr('width', (d) => {
      const xVal = xAxisScale(d.value);
      const xZero = xAxisScale(0);
      return xVal !== undefined && xZero !== undefined ? xVal - xZero : 0;
    })
    .attr('fill', (d) => (d.selected ? 'red' : 'purple'));

  barEnter
    .filter((d) => d.selected ?? false)
    .append('rect')
    .attr(
      'y',
      (d) => (yAxisScale(d.valueTag) ?? 0) + (metricScale(d.metric) ?? 0) - 5
    )
    .attr('x', 1)
    .attr('height', metricScale.bandwidth() + 10)
    .attr('width', (d) => {
      const xVal = xAxisScale(xAxisScale.domain()[1]);
      const xZero = xAxisScale(0);
      return xVal !== undefined && xZero !== undefined
        ? xVal - xZero + margin.left
        : 0;
    })
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('stroke-dasharray', '3, 3');

  barGroups.exit().remove();
}

export function renderXAxis(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  xAxisScale: d3.ScaleBand<string>,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  const xAxisGroup = chartSvg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisTop(xAxisScale).tickSize(0))
    .attr('class', 'x-axis');

  xAxisGroup
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.8em')
    .attr('dy', '0.15em');
}

export function renderLineXAxis(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  xAxisScale: d3.ScaleBand<string>,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  const parseDate = d3.timeParse('%d/%m/%Y');
  let previousTick: string = '';
  const xAxisGroup = chartSvg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(xAxisScale)
        .tickFormat((dateString: string, i: number) => {
          if (i == 0) return '';
          const date = parseDate(dateString);
          if (date) {
            const currentTick = d3.timeFormat('%Y')(date).toString();
            if (currentTick == previousTick) {
              return '';
            }
            previousTick = currentTick;
            return currentTick;
          }
          return '';
        })
        .tickSize(0)
    )
    .attr('class', 'x-axis')
    .attr('class', 'govuk-body-s');

  xAxisGroup
    .selectAll('text')
    .attr('text-anchor', 'end')
    .attr('dx', '0.2em')
    .attr('dy', '1.8em');
}

export function renderBarXAxis(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  xAxisScale: d3.ScaleLinear<number, number>,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  chartSvg
    .append('g')
    .attr('transform', `translate(0,${margin.top})`)
    .call(d3.axisTop(xAxisScale).tickSize(0))
    .attr('class', 'x-axis');
}

export function renderBarYAxis(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  yAxisScale: d3.ScaleBand<string>,
  margin: { top: number; right: number; bottom: number; left: number },
  labels: Map<string, string>,
  tickCount?: number,
  yAxisAsPercentage: boolean = false
): void {
  const yAxis = d3
    .axisLeft(yAxisScale)
    .ticks(tickCount ? tickCount : null)
    .tickFormat((d: any) => {
      const lookupValue = labels.get(d.toString());
      return `${lookupValue}`;
    })
    .tickSizeOuter(0);

  chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll('text')
    .attr('class', 'govuk-body-s')
    .style('text-anchor', 'end');
}

export function renderYAxis(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  yAxisScale: d3.ScaleLinear<number, number>,
  margin: { top: number; right: number; bottom: number; left: number },
  tickCount?: number,
  yAxisAsPercentage: boolean = false
): void {
  const yAxis = d3
    .axisLeft(yAxisScale)
    .ticks(tickCount ? tickCount : null)
    .tickSizeOuter(0);

  if (yAxisAsPercentage) {
    yAxis.tickFormat((d: any) => `${(d * 100).toFixed(2)}%`);
  }
  chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll('text')
    .attr('class', 'govuk-body-s');
}

export function renderLabels(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  xLabel: string,
  yLabel: string,
  title: string
): void {
  chartSvg
    .append('text')
    .attr('transform', `translate(${width / 2},${height - margin.bottom / 4})`)
    .style('text-anchor', 'start')
    .text(xLabel)
    .attr('class', 'x-axis-label');

  chartSvg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height - margin.bottom) / 2)
    .attr('y', margin.left / 4)
    .style('text-anchor', 'start')
    .text(yLabel)
    .attr('class', 'y-axis-label');

  chartSvg
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .style('text-anchor', 'start')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text(title)
    .attr('class', 'chart-title');
}

export function addTooltip(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  tooltipColor = '#000',
  tooltipBackgroundColor = '#fff'
): void {
  const tooltip = d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', tooltipBackgroundColor)
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('color', tooltipColor)
    .style('pointer-events', 'none')
    .style('box-shadow', '0px 2px 10px rgba(0, 0, 0, 0.1)');

  chartSvg
    .selectAll<SVGRectElement, BarchartData>('rect')
    .on('mouseover', function (event, dataItem) {
      tooltip
        .style('visibility', 'visible')
        .text(`${dataItem.valueTag}: ${dataItem.value}`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
      d3.select(this).style('fill-opacity', 0.7);
    })
    .on('mousemove', function (event) {
      tooltip
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.style('visibility', 'hidden');
      d3.select(this).style('fill-opacity', 1);
    });
}

export function renderMedianLine(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  median: number,
  yAxisScale: d3.ScaleLinear<number, number>,
  width: number,
  margin: { top: number; right: number; bottom: number; left: number },
  medianLineColor: string,
  medianLineDash: string
): void {
  chartSvg
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', yAxisScale(median))
    .attr('y2', yAxisScale(median))
    .attr('stroke', medianLineColor)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', medianLineDash)
    .attr('class', 'median-line');
}

export function renderLegend(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  margin: { top: number; right: number; bottom: number; left: number },
  medianLineColor: string,
  medianLineDash: string
): void {
  const legendGroup = chartSvg
    .append('g')
    .attr('transform', `translate(${margin.right + 20},${margin.top - 30})`);

  legendGroup
    .append('line')
    .attr('x1', 0)
    .attr('x2', 40)
    .attr('y1', 5)
    .attr('y2', 5)
    .attr('stroke', 'purple')
    .attr('stroke-width', 4);

  legendGroup
    .append('text')
    .attr('x', 50)
    .attr('y', 5)
    .text('All types')
    .style('font-size', '14px')
    .attr('alignment-baseline', 'middle');
}

export function renderLineLegend(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  legendEntries: { label: string; colour: string }[],
  size: number,
  width: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  const legendGroup = chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left - 100}, ${margin.top - 60})`);

  const spacing = 50;
  const maxItemsPerRow = 1;
  const rowHeight = 25;

  const legendItems = legendGroup
    .selectAll('.legend-item')
    .data(legendEntries)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (_, i) => {
      const x = (i % maxItemsPerRow) * 150;
      const y = Math.floor(i / maxItemsPerRow) * rowHeight;
      return `translate(${x}, ${y})`;
    });

  legendItems
    .append('rect')
    .attr('width', width)
    .attr('height', size)
    .attr('fill', (d) => d.colour);

  legendItems
    .append('text')
    .attr('x', size + spacing)
    .attr('y', size / 2)
    .attr('dy', '0.35em')
    .text((d) => d.label);
}

export function renderLine(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: { valueTag: string; value: number }[],
  xAxisScale: d3.ScalePoint<string>,
  yAxisScale: d3.ScaleLinear<number, number>,
  lineColor: string,
  strokeWidth: number,
  className: string
): void {
  const lineGenerator = d3
    .line<{ valueTag: string; value: number }>()
    .x((dataItem) => xAxisScale(dataItem.valueTag) ?? 0)
    .y((dataItem) => yAxisScale(dataItem.value) ?? 0);
  const linePath = chartSvg
    .selectAll<SVGPathElement, unknown>(className)
    .data([data]);
  linePath
    .enter()
    .append('path')
    .attr('class', 'line')
    .merge(linePath)
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', lineColor)
    .attr('stroke-width', strokeWidth);
  linePath.exit().remove();
}
