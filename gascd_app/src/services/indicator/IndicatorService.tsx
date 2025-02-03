import { generateBarchartSvg } from '../charts/BarchartService';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { Indicator } from '../../data/interfaces/Indicator';
import { MetricCardData } from '../../data/interfaces/MetricCardData';

class IndicatorService {
  private regionData: BarchartData[];
  private laData: BarchartData[];

  constructor(regionData: Indicator[], laData: Indicator[]) {
    this.regionData = this.transformToChartData(regionData);
    this.laData = this.transformToChartData(laData);
  }

  public getRegionData() {
    return this.regionData;
  }

  public getLaData() {
    return this.laData;
  }

  public createBarchart(
    location_name: string,
    xLabel: string,
    yLabel: string
  ): SVGSVGElement | null {
    return generateBarchartSvg({
      data:
        location_name === 'region' ? this.getRegionData() : this.getLaData(),
      width: 675,
      height: 400,
      xLabel: xLabel,
      yLabel: yLabel,
      title: '',
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
      data: this.regionData,
      width: 270,
      height: 200,
      xLabel: '',
      yLabel: '',
      title: '',
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
        'Percentage of Total Work Hours Covered by Agency Staff, by Region',
      svg: barchart,
      description:
        'The percentage of total work hours in each region that are completed by agency staff',
      sourceUrl: '#',
      metricDetailPageUrl: 'metric/capacity-tracker-total-hours-by-agency',
      sourceLinkString: 'CT',
      limitationDescription: 'lorem lorem lorem lorem lorem lorem',
    };
  }

  private transformToChartData(data: Indicator[]): BarchartData[] {
    return data
      .map((entry: Indicator) => ({
        xAxisValue: entry.location_name,
        metric: entry.metric,
        value: entry.value,
      }))
      .sort((a, b) => a.value - b.value);
  }
}

export default IndicatorService;
