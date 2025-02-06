import { generateBarchartSvg } from '../charts/BarchartService';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { Indicator } from '../../data/interfaces/Indicator';
import { MetricCardData } from '../../data/interfaces/MetricCardData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';

class IndicatorService {
  private chartData: BarchartData[];

  constructor(data: Indicator[], displayData: IndicatorDisplay) {
    this.chartData = this.transformToChartData(data, displayData);
  }

  public getChartData() {
    return this.chartData;
  }

  public createBarchart(
    location_name: string,
    xLabel: string,
    yLabel: string
  ): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.getChartData(),
      width: 675,
      height: 400,
      xLabel: xLabel, // displayData.denominator
      yLabel: yLabel, // displayData.numerator
      title: '', // displayData.metric_name
      showXValues: location_name === 'region' ? true : false,
      showQuartileRanges: location_name === 'region' ? false : true,
      medianLineColor: '#000000',
      barColor: '#1d70b8',
      showLegend: true,
      showToolTip: true,
      shortenLabels: false,
      yAxisAsPercentage: true,
      tickCount: 8,
      showMedian: false,
    });
  }

  public getMetricCardData(): MetricCardData {
    const barchart = generateBarchartSvg({
      data: this.getChartData(),
      width: 270,
      height: 200,
      xLabel: '', // displayData.denominator
      yLabel: '', // displayData.numerator
      title: '', // displayData.metric_name
      barColor: '#1d70b8',
      medianLineColor: '#000000',
      showLegend: false,
      showToolTip: false,
      shortenLabels: true,
      tickCount: 5,
      yAxisAsPercentage: true,
    });

    return {
      title:
        'Percentage of Total Work Hours Covered by Agency Staff, by Region', // displayData.metric_name
      svg: barchart,
      description:
        'The percentage of total work hours in each region that are completed by agency staff', // displayData.description
      sourceUrl: '#',
      metricDetailPageUrl: 'metric/capacity-tracker-total-hours-by-agency', // displayData.metric_id
      sourceLinkString: 'CT',
      limitationDescription: 'lorem lorem lorem lorem lorem lorem',
    };
  }

  private transformToChartData(data: Indicator[]): BarchartData[] {
    return data
      .map((entry: Indicator) => ({
        xAxisValue: entry.denominator,
        metric: entry.metric_id,
        value: entry.numerator,
      }))
      .sort((a, b) => a.value - b.value);
  }
}

export default IndicatorService;
