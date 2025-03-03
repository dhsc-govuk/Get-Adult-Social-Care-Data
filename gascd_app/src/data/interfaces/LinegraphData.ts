import { Locations } from "./Locations";

export interface LinegraphData {
  valueTag: string;
  value: number;
  metric: string;
  date: Date;
}

export interface LinegraphProps {
  data: LinegraphData[];
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
  colourMap?: Map<string, string>;
  groupedData: Map<string, LinegraphData[]>;
  labels?: Array<Locations>
}
