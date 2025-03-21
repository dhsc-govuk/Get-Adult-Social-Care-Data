import * as d3 from 'd3';
import React from 'react';
import * as ChartHelpers from '../../src/services/charts/ChartHelpers';
import { BarchartProps } from '../../src/data/interfaces/BarchartData';
import { generateBarchartSvg, generateLineGraphSvg } from '../../src/services/charts/ChartService';
import { LinegraphData, LinegraphProps } from '@/data/interfaces/LinegraphData';

let container: HTMLDivElement;
let ref: React.RefObject<SVGSVGElement>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  container.innerHTML = '<svg ref="testRef"></svg>';
  const svg = container.querySelector('svg');
  if (svg) {
    ref = { current: svg };
  } else {
    fail('SVG element not found in container');
  }
});

afterEach(() => {
  document.body.removeChild(container);
});

describe('generate bar chart', () => {  

  const data = [
    { valueTag: 'A', value: 30, metric: 'metric1', selected: false },
    { valueTag: 'B', value: 70, metric: 'metric1', selected: false },
  ];
  const props : BarchartProps = {
    data,
    width: 800,
    height: 300,
    xLabel: 'X Axis',
    yLabel: 'Y Axis',
    title: 'Test Chart',
    showXValues: true,
    showToolTip: true,
    labels: [{
      la_code: "A", la_name: "Area A",
      provider_location_id: '',
      provider_location_name: '',
      provider_id: '',
      provider_name: '',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: ''
    }],
  };

  it('should generate a bar chart', () => {
    const svg = d3.select(ref.current);
    const chartSvg = svg.append('g');
    const initializeSvgSpy = jest.spyOn(ChartHelpers, 'initializeSvg')
      .mockReturnValue(chartSvg);

    const xAxisScaleSpy = jest.spyOn(ChartHelpers, 'createBarXAxisScale');
    const yAxisScaleSpy = jest.spyOn(ChartHelpers, 'createBarYAxisScale');
    const calculateQuartilesSpy = jest.spyOn(ChartHelpers, 'calculateQuartiles');
    const renderBars = jest.spyOn(ChartHelpers, 'renderBars');

    const svgElement = generateBarchartSvg(props);
    expect(svgElement).toBeInstanceOf(SVGSVGElement);
    expect(initializeSvgSpy).toHaveBeenCalled();
    expect(initializeSvgSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        current: expect.any(SVGSVGElement)
      }),
      props.width,
      props.height
    );
    expect(xAxisScaleSpy).toHaveBeenCalled();
    expect(yAxisScaleSpy).toHaveBeenCalled();
    expect(calculateQuartilesSpy).toHaveBeenCalled();
    expect(renderBars).toHaveBeenCalled();
    
  });

  it('should handle empty data', () => {
    const props : BarchartProps = {
      data: [],
      xLabel: '',
      yLabel: ''
    };
    const svgElement = generateBarchartSvg(props);
    expect(svgElement).toBe(null);
  });

});

describe('generate line chart', () => {
  const data : LinegraphData[] = [
    { valueTag: 'A', value: 30, metric: 'metric1', date: new Date() },
    { valueTag: 'B', value: 70, metric: 'metric1', date: new Date() },
  ];

  const props : LinegraphProps = {
    data: data,
    xLabel: '',
    yLabel: '',
    groupedData: new Map()
  };

  it('should generate a line graph', () => {
    const svg = d3.select(ref.current);
    const chartSvg = svg.append('g');
    const initializeSvgSpy = jest.spyOn(ChartHelpers, 'initializeSvg')
      .mockReturnValue(chartSvg);

    const xAxisScaleSpy = jest.spyOn(ChartHelpers, 'createBarXAxisScale');
    const yAxisScaleSpy = jest.spyOn(ChartHelpers, 'createBarYAxisScale');
    const calculateQuartilesSpy = jest.spyOn(ChartHelpers, 'calculateQuartiles');
    const renderBars = jest.spyOn(ChartHelpers, 'renderBars');

    const svgElement = generateLineGraphSvg(props);
    expect(svgElement).toBeInstanceOf(SVGSVGElement);
    expect(initializeSvgSpy).toHaveBeenCalled();
    expect(initializeSvgSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        current: expect.any(SVGSVGElement)
      }),
      1000,
      400
    );
    expect(xAxisScaleSpy).toHaveBeenCalled();
    expect(yAxisScaleSpy).toHaveBeenCalled();
    expect(calculateQuartilesSpy).toHaveBeenCalled();
    expect(renderBars).toHaveBeenCalled();
    
  });

  it('should handle empty data', () => {
    const props : LinegraphProps = {
      data: [],
      xLabel: '',
      yLabel: '',
      groupedData: new Map()
    };
    const svgElement = generateLineGraphSvg(props);
    expect(svgElement).toBe(null);
  });
});