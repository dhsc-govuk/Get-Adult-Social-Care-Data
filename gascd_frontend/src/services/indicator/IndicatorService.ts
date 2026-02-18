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
        value: entry.data_point ?? 0, // this should never happen as we filter out nulls, but it won't build otherwise.
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
        value: entry.data_point ?? 0, // this should never happen as we filter out nulls, but it won't build otherwise.
        date: IndicatorService.parseDate(entry),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  public static parseDate(entry: Indicator): Date {
    if (typeof entry.metric_date === 'string') {
      if (entry.metric_date.includes('/')) {
        // expects dd/mm/yyyy
        const dateparts = entry.metric_date.split('/');
        return new Date(
          parseInt(dateparts[2]), // year,
          parseInt(dateparts[1]) - 1, // month index (zero-based)
          parseInt(dateparts[0]) // dom
        );
      } else {
        // Assume it is a parseable date
        return new Date(entry.metric_date);
      }
    }
    return entry.metric_date;
  }

  public static formatDate(dateStr: string): string {
    let date;
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else if (dateStr.includes('-')) {
      date = new Date(dateStr);
    } else {
      return dateStr;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  public static getMostRecentIndicator(
    indicators: Indicator[],
    metric_ids?: string[]
  ): string {
    if (indicators.length === 0) {
      return '';
    }

    let filtered_indicators = indicators;
    if (metric_ids) {
      filtered_indicators = indicators.filter((item) =>
        metric_ids.includes(item.metric_id)
      );
    }

    if (filtered_indicators.length === 0) {
      return '';
    }

    return filtered_indicators
      .reduce((latest, current) => {
        return this.parseDate(current) > this.parseDate(latest)
          ? current
          : latest;
      }, filtered_indicators[0])
      .metric_date.toString();
  }

  public static getMostRecentDate(
    data: Indicator[],
    metric_ids?: string[]
  ): string {
    const recentData = this.getMostRecentIndicator(data, metric_ids);
    if (recentData) {
      return this.formatDate(recentData);
    } else {
      return '';
    }
  }

  public static getMostRecentMonthYear(
    data: Indicator[],
    metric_ids?: string[]
  ): string {
    const recentData = this.getMostRecentIndicator(data, metric_ids);
    if (recentData) {
      const date = this.parseDate(
        data.find((d) => d.metric_date.toString() === recentData)!
      );
      return new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
      }).format(date);
    } else {
      return '';
    }
  }

  public static getFinancialYear(
    data: Indicator[],
    metric_ids?: string[]
  ): string {
    const recentData = this.getMostRecentIndicator(data, metric_ids);
    if (recentData) {
      const date = this.parseDate(
        data.find((d) => d.metric_date.toString() === recentData)!
      );
      let yearString = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
      }).format(date);

      let year = parseInt(yearString);

      return `financial year ${year - 1} to ${year}`;
    } else {
      return '';
    }
  }
}

export default IndicatorService;
