import {
  generateBarchartSvg,
  generateLineGraphSvg,
} from '../charts/ChartService';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { Indicator } from '../../data/interfaces/Indicator';
import { MetricCardData } from '../../data/interfaces/MetricCardData';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { LinegraphData } from '@/data/interfaces/LinegraphData';
import { Locations } from '@/data/interfaces/Locations';

class IndicatorService {
  private chartData: BarchartData[];
  private linegraphData: LinegraphData[];
  private chartDisplayData: IndicatorDisplay[];
  private lineGraphDisplayData: IndicatorDisplay[];

  constructor(
    chartData: Indicator[],
    lineData: Indicator[],
    chartDisplayData: IndicatorDisplay[],
    lineGraphDisplayData: IndicatorDisplay[],
    selected_location_id: string
  ) {
    this.chartData = this.transformToChartData(chartData, selected_location_id);
    this.linegraphData = this.transformToLineChartData(lineData);
    this.chartDisplayData = chartDisplayData;
    this.lineGraphDisplayData = lineGraphDisplayData;
  }

  public getChartData() {
    return this.chartData;
  }

  public getChartDisplayData(): IndicatorDisplay[] {
    return this.chartDisplayData;
  }

  public getLineGraphDisplayData(): IndicatorDisplay[] {
    return this.lineGraphDisplayData;
  }

  public getLinegraphData() {
    return this.linegraphData;
  }

  public createBarchart(
    locations: Locations[] | undefined
    // containerWidth: number,
    // containerHeight: number
  ): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.getChartData(),
      width: 600,
      height: 600,
      xLabel: this.chartDisplayData[0].denominator,
      yLabel: this.chartDisplayData[0].numerator,
      title: this.chartDisplayData[0].metric_name,
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
      labels: locations,
    });
  }

  public createLinegraph(
    locations: Locations[] | undefined
  ): SVGSVGElement | null {
    return generateLineGraphSvg({
      data: this.getLinegraphData(),
      width: 600,
      height: 600,
      xLabel: '',
      yLabel: '',
      title: '',
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
      labels: locations,
      colourMap: new Map([
        ['bedcount_per_100000_adults_total', 'purple'],
        ['bedcount_per_100000_adults_total_dementia_residential', 'orange'],
        ['bedcount_per_100000_adults_total_dementia_nursing', 'gold'],
      ]),
      groupedData: this.groupByMetricId(
        this.getLinegraphData(),
        this.getLineGraphDisplayData()
      ),
    });
  }

  private transformToChartData(
    data: Indicator[],
    selected_location_id: string
  ): BarchartData[] {
    return data
      .filter((d) => d.data_point !== null)
      .map((entry: Indicator) => ({
        valueTag: entry.location_id,
        metric: entry.metric_id,
        value: entry.data_point,
        selected: entry.location_id == selected_location_id ? true : false,
      }))
      .sort((a, b) => a.value - b.value);
  }

  private groupByMetricId(
    data: LinegraphData[],
    lineGraphDisplayData: IndicatorDisplay[]
  ): Map<
    string,
    { metric_id: string; metric_name: string; data: LinegraphData[] }
  > {
    const metricLookup = new Map(
      lineGraphDisplayData.map((entry) => [
        entry.metric_id,
        entry.filter_bedtype,
      ])
    );

    const groupedData = data.reduce((map, entry) => {
      const metricName = metricLookup.get(entry.metric) || 'Unknown Metric';

      if (!map.has(entry.metric)) {
        map.set(entry.metric, {
          metric_id: entry.metric,
          metric_name: metricName,
          data: [],
        });
      }

      map.get(entry.metric)?.data.push(entry);
      return map;
    }, new Map<string, { metric_id: string; metric_name: string; data: LinegraphData[] }>());

    return groupedData;
  }

  private transformToLineChartData(data: Indicator[]): LinegraphData[] {
    return data
      .filter((d) => d.data_point !== null)
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
