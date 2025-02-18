import { generateBarchartSvg } from '../charts/ChartService';
import { BarchartData } from '../../data/interfaces/BarchartData';
import { CapacityTrackerTotalHoursAgencyWorked } from '../../data/interfaces/CapacityTrackerTotalHoursAgencyWorked';
import { MetricCardData } from '../../data/interfaces/MetricCardData';

class CapacityTrackerTotalHoursAgencyWorkedService {
  private totalHoursAgencyWorkedByRegionData: BarchartData[];
  private totalHoursAgencyWorkedByLaData: BarchartData[];

  constructor(
    capacityTrackerTotalHoursAgencyWorkedByRegionData: CapacityTrackerTotalHoursAgencyWorked[],
    capacityTrackerTotalHoursAgencyWorkedByLaData: CapacityTrackerTotalHoursAgencyWorked[]
  ) {
    this.totalHoursAgencyWorkedByRegionData = this.transformToChartData(
      capacityTrackerTotalHoursAgencyWorkedByRegionData
    );
    this.totalHoursAgencyWorkedByLaData = this.transformToChartData(
      capacityTrackerTotalHoursAgencyWorkedByLaData
    );
  }

  public getTotalHoursAgencyWorkedByRegionData() {
    return this.totalHoursAgencyWorkedByRegionData;
  }

  public getTotalHoursAgencyWorkedByLaData() {
    return this.totalHoursAgencyWorkedByLaData;
  }

  public createByRegionBarchart(): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.totalHoursAgencyWorkedByRegionData,
      width: 675,
      height: 400,
      xLabel: 'Regions',
      yLabel: 'Total hours worked that are agency',
      title: '',
      medianLineColor: '#000000',
      barColor: '#1d70b8',
      showLegend: false,
      showToolTip: true,
      shortenLabels: false,
      yAxisAsPercentage: true,
      tickCount: 8,
    });
  }

  public createByLaBarchart(): SVGSVGElement | null {
    return generateBarchartSvg({
      data: this.totalHoursAgencyWorkedByLaData,
      width: 675,
      height: 400,
      xLabel: 'Local Authorities',
      yLabel: 'Total hours worked that are agency',
      title: '',
      showXValues: false,
      showQuartileRanges: true,
      medianLineColor: '#000000',
      barColor: '#1d70b8',
      showLegend: false,
      showToolTip: true,
      shortenLabels: false,
      yAxisAsPercentage: true,
      tickCount: 8,
    });
  }

  public getMetricCardData(): MetricCardData {
    const barchart = generateBarchartSvg({
      data: this.totalHoursAgencyWorkedByRegionData,
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

  private transformToChartData(
    data: CapacityTrackerTotalHoursAgencyWorked[]
  ): BarchartData[] {
    return data
      .map((entry: CapacityTrackerTotalHoursAgencyWorked) => ({
        xAxisValue: entry.location_name,
        metric: entry.metric,
        value: entry.value,
      }))
      .sort((a, b) => a.value - b.value);
  }
}

export default CapacityTrackerTotalHoursAgencyWorkedService;
