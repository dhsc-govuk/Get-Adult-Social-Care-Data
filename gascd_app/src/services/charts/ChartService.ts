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
  renderBarLegend,
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
    top: height * 0.1,
    right: width * 0.1,
    bottom: showXValues ? height * 0.05 : height * 0.05,
    left: width * 0.2,
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

  if (showLegend) {
    renderBarLegend(chartSvg, metric_data, 10, dynamicMargin);
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
  groupedData = new Map<string, LinegraphData[]>(),
  labels = [],
}: LinegraphProps): SVGSVGElement | null {
  if (!data.length) return null;

  const dynamicMargin = {
    top: height * 0.1,
    right: width * 0.1,
    bottom: showXValues ? height * 0.2 : height * 0.1,
    left: width * 0.2,
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

  const xAxisScale = createXAxisScale(data, width, dynamicMargin);
  const yAxisScale = createYAxisScale(data, height, dynamicMargin);
  const { median, quartiles } = calculateQuartiles(data);
  const defaultLineColor = '#800080';
  const strokeWidth = 3;

  for (const key of groupedData.keys()) {
    const value = groupedData.get(key);
    renderLine(
      chartSvg,
      value ?? [],
      xAxisScale,
      yAxisScale,
      colourMap.get(key) ?? defaultLineColor,
      strokeWidth,
      key
    );
  }

  if (showXValues) {
    renderLineXAxis(chartSvg, xAxisScale, height, dynamicMargin);
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

  if (showLegend) {
    renderLegend(
      chartSvg,
      width,
      dynamicMargin,
      medianLineColor,
      medianLineDash
    );
  }

  return svgElement;
}
