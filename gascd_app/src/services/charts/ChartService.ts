import { LinegraphData, LinegraphProps } from '@/data/interfaces/LinegraphData';
import { BarchartProps } from '../../data/interfaces/BarchartData';
import {
  initializeSvg,
  createXAxisScale,
  createYAxisScale,
  renderBars,
  renderXAxis,
  renderYAxis,
  renderLabels,
  addTooltip,
  renderMedianLine,
  renderLegend,
  truncateLabels,
  calculateQuartiles,
  renderLine,
  renderLineXAxis,
  createBarYAxisScale,
  createBarXAxisScale,
  renderBarXAxis,
  renderBarYAxis,
  renderLineLegend,
} from './ChartHelpers';

export function generateBarchartSvg({
  data,
  width = 1000,
  height = 400,
  xLabel,
  yLabel,
  barColor = '#5f0f40',
  medianLineColor = '#808000',
  medianLineDash = '5,5',
  title = '',
  showXValues = true,
  showQuartileRanges = false,
  highlightQuartileColors = ['#00703c', '#1d70b8', '#d4351c', '#f47738'],
  showMedian = true,
  showLegend = true,
  shortenLabels = false,
  showToolTip = true,
  tickCount,
  yAxisAsPercentage = false,
  labels = [],
}: BarchartProps): SVGSVGElement | null {
  if (!data.length) return null;

  const dynamicMargin = {
    top: height * 0.05,
    right: width * 0.05,
    bottom: showXValues ? height * 0.05 : height * 0.03,
    left: width * 0.35,
  };

  const svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const ref = { current: svgElement };

  const chartSvg = initializeSvg(ref, width, height);

  data = data.map((entry) => ({
    ...entry,
    valueTag: shortenLabels
      ? truncateLabels(entry.valueTag, 16)
      : entry.valueTag,
  }));

  const metric_data: string[] = Array.from(
    new Set(data.map((entry) => entry.metric))
  );

  const xAxisScale = createBarXAxisScale(data, width, dynamicMargin);
  const yAxisScale = createBarYAxisScale(data, height, dynamicMargin);
  const { median, quartiles } = calculateQuartiles(data);

  renderBars(chartSvg, data, xAxisScale, yAxisScale, dynamicMargin);

  if (showXValues) {
    renderBarXAxis(chartSvg, xAxisScale, height, dynamicMargin);
  }

  const labelsMap = labels.reduce(
    (map, la) => map.set(la.la_code, la.la_name),
    new Map<string, string>()
  );

  renderBarYAxis(
    chartSvg,
    yAxisScale,
    dynamicMargin,
    labelsMap,
    tickCount,
    yAxisAsPercentage
  );
  renderLabels(chartSvg, width, height, dynamicMargin, xLabel, yLabel, title);

  if (showToolTip) {
    addTooltip(chartSvg);
  }

  return svgElement;
}

export function generateLineGraphSvg({
  data,
  width = 1000,
  height = 400,
  xLabel,
  yLabel,
  medianLineColor = '#808000',
  medianLineDash = '5,5',
  title = '',
  showXValues = true,
  showMedian = true,
  showLegend = true,
  shortenLabels = false,
  showToolTip = true,
  tickCount,
  yAxisAsPercentage = false,
  colourMap = new Map(),
  groupedData = new Map<
    string,
    { metric_id: string, metric_name: string; data: LinegraphData[] }
  >(),
  labels = [],
}: LinegraphProps): SVGSVGElement | null {
  if (!data.length) return null;

  const svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const ref = { current: svgElement };

  let legendHeight = 0;
  let legendEntries: { label: string; colour: string }[] = [];

  if (showLegend) {
    legendEntries = Array.from(groupedData.values()).map(({ metric_id, metric_name }) => ({
      label: shortenLabels ? truncateLabels(metric_name, 16) : metric_name,
      colour: colourMap.get(metric_id) ?? '#800080',
    }));

    const maxItemsPerRow = Math.floor((width - 40) / 150);
    const legendRowCount = Math.ceil(legendEntries.length / maxItemsPerRow);
    legendHeight = legendRowCount * 40;
  }

  const dynamicMargin = {
    top: height * 0.1 + legendHeight,
    right: width * 0.1,
    bottom: height * 0.1,
    left: width * 0.2,
  };

  const adjustedChartHeight = height - legendHeight;
  const chartSvg = initializeSvg(ref, width, height);

  if (showLegend) {
    renderLineLegend(chartSvg, legendEntries, 5, 45, {
      top: height * 0.1 + 10,
      right: width * 0.1,
      bottom: showXValues ? height * 0.2 : height * 0.1,
      left: width * 0.2,
    });
  }

  data = data.map((entry) => ({
    ...entry,
    valueTag: shortenLabels
      ? truncateLabels(entry.valueTag, 16)
      : entry.valueTag,
  }));

  const xAxisScale = createXAxisScale(data, width, dynamicMargin);
  const yAxisScale = createYAxisScale(data, adjustedChartHeight, dynamicMargin);
  const { median, quartiles } = calculateQuartiles(data);
  const defaultLineColor = '#800080';
  const strokeWidth = 3;

  for (const { metric_id, metric_name, data } of groupedData.values()) {
    renderLine(
      chartSvg,
      data,
      xAxisScale,
      yAxisScale,
      colourMap.get(metric_id) ?? defaultLineColor,
      strokeWidth,
      metric_name
    );
  }

  if (showXValues) {
    renderLineXAxis(chartSvg, xAxisScale, adjustedChartHeight, dynamicMargin);
  }

  renderYAxis(
    chartSvg,
    yAxisScale,
    dynamicMargin,
    tickCount,
    yAxisAsPercentage
  );
  renderLabels(chartSvg, width, height, dynamicMargin, xLabel, yLabel, title);

  if (showMedian && median) {
    renderMedianLine(
      chartSvg,
      median,
      yAxisScale,
      width,
      dynamicMargin,
      medianLineColor,
      medianLineDash
    );
  }

  return svgElement;
}
