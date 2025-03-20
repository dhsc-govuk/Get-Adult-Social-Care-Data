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
const selectedLocationId: string = '';
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
});
