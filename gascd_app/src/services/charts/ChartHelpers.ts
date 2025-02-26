import * as d3 from 'd3';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { LinegraphData } from '@/data/interfaces/LinegraphData';

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
    .domain([0, d3.max(data, (dataItem) => dataItem.value) ?? 0])
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
    .domain([0, d3.max(data, (dataItem) => dataItem.value) ?? 0])
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

  const colorScale = getMetricColorScale(uniqueMetrics);

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
      (d) => (yAxisScale(d.valueTag) ?? 0) + (metricScale(d.metric) ?? 0)
    )
    .attr('x', margin.left)
    .attr('height', metricScale.bandwidth())
    .attr('width', (d) => {
      const xVal = xAxisScale(d.value);
      const xZero = xAxisScale(0);
      return xVal !== undefined && xZero !== undefined ? xVal - xZero : 0;
    })
    .attr('fill', (d) => colorScale(d.metric));

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
  const customTickFormat = (d: string): string => {
    const currentDate = new Date(d);
    const currentYear = currentDate.getFullYear();

    const domain = xAxisScale.domain();
    const index = domain.indexOf(d);

    if (index === 0) return currentYear.toString();

    const previousDate = new Date(domain[index - 1]);
    const previousYear = previousDate.getFullYear();

    return currentYear !== previousYear ? currentYear.toString() : '';
  };

  const xAxis = d3
    .axisBottom(xAxisScale)
    .tickSize(0)
    .tickFormat(customTickFormat);
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
  tickCount?: number,
  yAxisAsPercentage: boolean = false
): void {
  const yAxis = d3
    .axisLeft(yAxisScale)
    .ticks(tickCount ? tickCount : null)
    .tickSizeOuter(0);

  chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll('text');
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
    .selectAll('text');
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
    .style('text-anchor', 'middle')
    .text(xLabel)
    .attr('class', 'x-axis-label');

  chartSvg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height - margin.bottom) / 2)
    .attr('y', margin.left / 4)
    .style('text-anchor', 'middle')
    .text(yLabel)
    .attr('class', 'y-axis-label');

  chartSvg
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .style('text-anchor', 'middle')
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

export function renderBarLegend(
  chartSvg: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: string[],
  size: number,
  margin: { top: number; right: number; bottom: number; left: number }
): void {
  const colorScale = getMetricColorScale(data);

  const legendGroup = chartSvg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top - 30})`);

  legendGroup
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', 100)
    .attr('y', (d, i) => 100 + i * (size + 5))
    .attr('width', size)
    .attr('height', size)
    .style('fill', (d) => colorScale(d) ?? '#000');

  legendGroup
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', 100 + size * 1.2)
    .attr('y', (d, i) => 100 + i * (size + 5) + size / 2)
    .style('fill', (d) => colorScale(d) ?? '#000')
    .text((d) => d)
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle');
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
