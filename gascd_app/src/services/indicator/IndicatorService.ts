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

  constructor(chartData: Indicator[], lineData: Indicator[], displayData: IndicatorDisplay) {
    this.chartData = this.transformToChartData(chartData);
    this.linegraphData = this.transformToLineChartData(lineData);
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

  public createBarchart(locationNames: [] | undefined
    // containerWidth: number,
    // containerHeight: number
  ): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.getChartData(),
      width: 600,
      height: 600,
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
      labels: locationNames
    });
  }

  public createLinegraph(locationNames: [] | undefined): SVGSVGElement | null {
    return generateLineGraphSvg({
      data: this.getLinegraphData(),
      width: 600,
      height: 400,
      xLabel: '',
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
      labels: locationNames,
      colourMap: new Map([
        ['bedcount_per_100000_adults_total', 'purple'],
        ['bedcount_per_100000_adults_total_dementia_residential', 'orange'],
      ]),
      groupedData: this.groupByMetricId(this.getLinegraphData()),
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
      .filter(d => d.data_point !== null)    
      .map((entry: Indicator) => ({
        valueTag: entry.location_id,
        metric: entry.metric_id,
        value: entry.data_point,
      }))
      .sort((a, b) => a.value - b.value);
  }

  private groupByMetricId(data: LinegraphData[]): Map<string, LinegraphData[]> {
    const map = data.reduce((map, entry) => {
      if (!map.has(entry.metric)) {
        map.set(entry.metric, []);
      }
      map.get(entry.metric)?.push(entry);
      return map;
    }, new Map<string, LinegraphData[]>());
    return map;
  }

  private transformToLineChartData(data: Indicator[]): LinegraphData[] {
    return data
      .filter(d => d.data_point !== null)
      .map((entry: Indicator) => ({
        valueTag: entry.metric_date.toString(),
        metric: entry.metric_id,
        value: entry.data_point,
        date: this.parseDate(entry.metric_date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private parseDate(date: Date) {
    const parts = date.toString().split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return new Date(formattedDate);
  }
}

export default IndicatorService;
