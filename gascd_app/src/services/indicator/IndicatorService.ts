import {
  generateBarchartSvg,
  generateLineGraphSvg,
} from '../charts/ChartService';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { Indicator } from '../../data/interfaces/Indicator';
import { MetricCardData } from '../../data/interfaces/MetricCardData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { LinegraphData } from '@/data/interfaces/LinegraphData';

class IndicatorService {
  private chartData: BarchartData[];
  private linegraphData: LinegraphData[];
  private displayData: IndicatorDisplay;

  constructor(data: Indicator[], displayData: IndicatorDisplay) {
    this.chartData = this.transformToChartData(data);
    this.linegraphData = this.transformToLineChartData(data);
    this.displayData = displayData;
  }

  public getChartData() {
    return this.chartData;
  }

  public getDisplayData(): IndicatorDisplay {
    return this.displayData;
  }

  public getLinegraphData() {
    return this.linegraphData;
  }

  public createBarchart(): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.getChartData(),
      width: 675,
      height: 400,
      xLabel: this.displayData.denominator,
      yLabel: this.displayData.numerator,
      title: this.displayData.metric_name,
      showXValues: true,
      showQuartileRanges: true,
      medianLineColor: '#000000',
      barColor: '#1d70b8',
      showLegend: true,
      showToolTip: true,
      shortenLabels: false,
      yAxisAsPercentage: false,
      tickCount: 8,
      showMedian: false,
    });
  }

  public createLinegraph(): SVGSVGElement | null {
    return generateLineGraphSvg({
      data: this.getLinegraphData(),
      width: 675,
      height: 400,
      xLabel: 'Year',
      yLabel: this.displayData.numerator,
      title: this.displayData.metric_name,
      showXValues: true,
      showQuartileRanges: true,
      medianLineColor: '#000000',
      barColor: '#1d70b8',
      showLegend: true,
      showToolTip: true,
      shortenLabels: false,
      yAxisAsPercentage: false,
      tickCount: 8,
      showMedian: false,
    });
  }

  public getMetricCardData(): MetricCardData {
    const barchart = generateBarchartSvg({
      data: this.getChartData(),
      width: 270,
      height: 200,
      xLabel: this.displayData.denominator,
      yLabel: this.displayData.numerator,
      title: this.displayData.metric_name,
      barColor: '#1d70b8',
      medianLineColor: '#000000',
      showLegend: false,
      showToolTip: false,
      shortenLabels: true,
      tickCount: 5,
      yAxisAsPercentage: true,
    });

    return {
      title: this.displayData.metric_name,
      svg: barchart,
      description: this.displayData.description,
      sourceUrl: '#',
      metricDetailPageUrl: `metric/${this.displayData.metric_id}`,
      sourceLinkString: 'CT',
      limitationDescription: 'lorem lorem lorem lorem lorem lorem',
    };
  }

  private transformToChartData(data: Indicator[]): BarchartData[] {
    return data
      .map((entry: Indicator) => ({
        valueTag: entry.location_id,
        metric: entry.metric_id,
        value: entry.data_point,
      }))
      .sort((a, b) => a.value - b.value);
  }

  private transformToLineChartData(data: Indicator[]): LinegraphData[] {
    return data
      .map((entry: Indicator) => ({
        valueTag: entry.metric_date.toString(),
        metric: entry.metric_id,
        value: entry.data_point,
        date: new Date(entry.metric_date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export default IndicatorService;
