import { Indicator } from '@/data/interfaces/Indicator';
import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { Locations } from '@/data/interfaces/Locations';
import IndicatorService from '@/services/indicator/IndicatorService';
import {
  barchartDisplayData,
  barchartIndicators,
  liengraphDisplayData,
  linegraphIndicators,
} from './MockData';

const chartData: Indicator[] = barchartIndicators;
const lineData: Indicator[] = linegraphIndicators;
const chartDisplayData: IndicatorDisplay[] = barchartDisplayData;
const lineDisplayData: IndicatorDisplay[] = liengraphDisplayData;
const selectedLocationId: string = '1';
const locationNames: Locations[] = [
  {
    la_code: '1',
    la_name: 'foo',
    provider_location_id: '',
    provider_location_name: '',
    provider_id: '',
    provider_name: '',
    region_code: '',
    region_name: '',
    country_code: '',
    country_name: '',
    load_date_time: '',
  },
];

const indicatorService = new IndicatorService(
  chartData,
  lineData,
  chartDisplayData,
  lineDisplayData,
  selectedLocationId
);
describe('IndicatorService', () => {
  it('Renders the bar chart svg correctly', async () => {
    const barchart = indicatorService.createBarchart(locationNames);
    expect(barchart?.getAttribute('width')).toBe('600');
  });
  it('Renders the line graph svg correctly', async () => {
    const linegraph = indicatorService.createLinegraph(locationNames);
    expect(linegraph?.getAttribute('width')).toBe('600');
  });
  it('Returns the display data when the getChartDisplayData is called', () => {
    expect(indicatorService.getChartDisplayData()).toBe(chartDisplayData);
  });
  it('Correctly transforms the bar chart data', () => {
    const chartData = indicatorService.getChartData();
    expect(chartData[0].value).toBe(100);
    expect(chartData[0].metric).toBe('1');
    expect(chartData[0].valueTag).toBe('1');
    expect(chartData[0].selected).toBeTruthy;
    expect(chartData[2].value).toBe(200);
    expect(chartData[2].metric).toBe('1');
    expect(chartData[2].valueTag).toBe('3');
    expect(chartData[2].selected).toBeFalsy;
  });
  it('Correctly transforms the line graph data', () => {
    const graphData = indicatorService.getLinegraphData();
    expect(graphData[0].value).toBe(200);
    expect(graphData[0].metric).toBe('1');
    expect(graphData[0].valueTag).toBe(new Date(2024, 1, 1).toString());
    expect(graphData[2].value).toBe(100);
    expect(graphData[2].metric).toBe('1');
    expect(graphData[2].valueTag).toBe(new Date(2024, 3, 1).toString());
  });
});

describe('parseDate', () => {
  it('should parse date strings', () => {
    const entry_with_string: Indicator = {
      metric_id: '1',
      location_id: '1',
      data_point: 10,
      metric_date_type: '',
      // Some of the backend data has dates in this format
      metric_date: '23/4/2020',
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 3, 10),
    };
    const result: Date = IndicatorService.parseDate(entry_with_string);
    expect(result).toEqual(new Date(2020, 4, 23));

    const entry_with_iso_string: Indicator = {
      metric_id: '1',
      location_id: '1',
      data_point: 10,
      metric_date_type: '',
      metric_date: '1995-01-20T05:30:00Z',
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 3, 10),
    };
    const result_iso: Date = IndicatorService.parseDate(entry_with_iso_string);
    expect(result_iso).toEqual(new Date(Date.UTC(1995, 0, 20, 5, 30)));
  });
  it('should return dates as-is', () => {
    const entry_with_date: Indicator = {
      metric_id: '1',
      location_id: '1',
      data_point: 10,
      metric_date_type: '',
      metric_date: new Date(2021, 6, 5),
      location_type: '',
      numerator: 0,
      multiplier: 0,
      denominator: 0,
      load_date_time: new Date(2024, 3, 10),
    };
    const result: Date = IndicatorService.parseDate(entry_with_date);
    expect(result).toEqual(new Date(2021, 6, 5));
  });
});
