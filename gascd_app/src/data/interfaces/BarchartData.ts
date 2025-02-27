export interface BarchartData {
  valueTag: string;
  value: number;
  metric: string;
}

export interface BarchartProps {
  data: BarchartData[];
  width?: number;
  height?: number;
  xLabel: string;
  yLabel: string;
  barColor?: string;
  medianLineColor?: string;
  medianLineDash?: string;
  title?: string;
  showXValues?: boolean;
  showQuartileRanges?: boolean;
  highlightQuartileColors?: Array<string>;
  showMedian?: boolean;
  showLegend?: boolean;
  shortenLabels?: boolean;
  showToolTip?: boolean;
  tickCount?: number;
  yAxisAsPercentage?: boolean;
}
