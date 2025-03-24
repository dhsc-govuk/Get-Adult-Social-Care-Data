import { BarchartData } from '@/data/interfaces/BarchartData';
import { calculateQuartiles, createBarXAxisScale, createBarYAxisScale, createXAxisScale, createYAxisScale, initializeSvg, renderBars, renderLegend, renderLine, renderLineLegend, renderLineXAxis, renderLineYAxis, truncateLabels } from '../../src/services/charts/ChartHelpers';
import * as d3 from 'd3';
import React from 'react';

describe('initializeSvg', () => {
  let container: HTMLDivElement;
  let ref: React.RefObject<SVGSVGElement>;

  const width = 500;
  const height = 400;

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

  describe('SVG Dimensions', () => {
    it('should set the SVG width, height & background', () => {
      if (ref.current) {
        initializeSvg(ref, width, height);
        const svg = d3.select(ref.current);
        expect(parseInt(svg.attr('width') || '0')).toBe(width);
        expect(parseInt(svg.attr('height') || '0')).toBe(height);
        const rect = d3.select(ref.current).select('rect');
        expect(parseInt(rect.attr('width') || '0')).toBe(width);
        expect(parseInt(rect.attr('height') || '0')).toBe(height);
      } else {
        fail('ref.current is null');
      }
    });
  });

  describe('SVG Scale', () => {
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const data: BarchartData[] = [
        { valueTag: 'A', value: 10, metric: 'a' },
        { valueTag: 'B', value: 20, metric: 'b' },
        { valueTag: 'C', value: 15, metric: 'c' },
      ];
    it('should create line x-axis scale', () => {
        const scale = createXAxisScale(data, width, margin);
        const expectedDomain = ['A', 'B', 'C'];
        expect(scale.domain()).toEqual(expectedDomain);
        const expectedRange = [margin.left, width - margin.right];
        expect(scale.range()).toEqual(expectedRange);
        expect(scale.padding()).toBe(0.1);
    });
    it('should create line y-axis scale', () => {
        const scale = createYAxisScale(data, height, margin);
        const expectedDomain = [0, 20];
        expect(scale.domain()).toEqual(expectedDomain);
        const expectedRange = [height - margin.bottom, margin.top];
        expect(scale.range()).toEqual(expectedRange);
    });

    it('should create bar x-axis scale', () => {
        const scale =  createBarXAxisScale(data, width, margin);
        const expectedDomain = [0, 20];
        expect(scale.domain()).toEqual(expectedDomain);
        const expectedRange = [margin.left, width - margin.right];
        expect(scale.range()).toEqual(expectedRange);
    });

    it('should create bar y-axis scale', () => {
        const scale = createBarYAxisScale(data, height, margin);
        const expectedDomain = ['A', 'B', 'C'];
        expect(scale.domain()).toEqual(expectedDomain);
        const expectedRange = [height - margin.bottom, margin.top];
        expect(scale.range()).toEqual(expectedRange);
    });
  });

  describe('calculateQuartiles', () => {
    it('should calculate quartiles for a dataset', () => {
      const data: BarchartData[] = [
        { valueTag: 'A', value: 10, metric: 'a' },
        { valueTag: 'B', value: 20, metric: 'b' },
        { valueTag: 'C', value: 15, metric: 'c' },
        { valueTag: 'D', value: 25, metric: 'd' },
        { valueTag: 'E', value: 5, metric: 'e' },
      ];
      const result = calculateQuartiles(data);
      expect(result.median).toBe(15);
      expect(result.quartiles.Q1).toBe(10);
      expect(result.quartiles.Q3).toBe(20);
    });
    it('should handle empty dataset to calculate quartiles', () => {
      const data: BarchartData[] = [];
      const result = calculateQuartiles(data);

      expect(result.quartiles.Q1).toBe(0);
      expect(result.quartiles.Q2).toBe(0);
      expect(result.quartiles.Q3).toBe(0);
    });
  });

  describe('render Axis', () => {
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const data: BarchartData[] = [
        { valueTag: 'A', value: 10, metric: 'a' },
        { valueTag: 'B', value: 20, metric: 'b' },
        { valueTag: 'C', value: 15, metric: 'c' },
      ];

    it('should append x-axis ticks to the chart SVG', () => {
        const svg = d3.select(ref.current);
        const chartSvg = svg.append('g');
        const xAxisScale = d3.scaleBand<string>().domain(['01/01/2022', '01/03/2022', '01/04/2022', '01/01/2023']).range([0, 400]);
        renderLineXAxis(chartSvg, xAxisScale, height, margin);
        const tickTexts = chartSvg.selectAll('.tick text').nodes().map((node) => (node as SVGTextElement).textContent);
        expect(tickTexts).toEqual(['', '2022', '', '2023']);
      });

      it('should append y-axis ticks to the chart SVG', () => {
        const svg = d3.select(ref.current);
        const chartSvg = svg.append('g');
        const yAxisScale = d3.scaleLinear().domain([5,10,15]).range([0, 15]);
        renderLineYAxis(chartSvg, yAxisScale, margin, 4);
        const tickTexts = chartSvg.selectAll('.tick text').nodes().map((node) => (node as SVGTextElement).textContent);
        expect(tickTexts).toEqual(['6', '8', '10','12','14']);
      });

  });

  describe('render Lines', () => {    
    const data = [
      { valueTag: 'A', value: 10 },
      { valueTag: 'B', value: 20 },
      { valueTag: 'C', value: 15 },
    ];
    const xAxisScale = d3.scalePoint<string>().domain(['A', 'B', 'C']).range([0, 100]);
    const yAxisScale = d3.scaleLinear().domain([0, 20]).range([100, 0]);

    const lineColor = 'red';
    const strokeWidth = 2;
    const className = 'test-line';

    it ('should render line on chart svg', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      renderLine(chartSvg, data, xAxisScale, yAxisScale, lineColor, strokeWidth, className);
      
      const linePath = chartSvg.select('path.line');

      expect(linePath.node()).toBeTruthy();
      expect(linePath.attr('fill')).toBe('none');
      expect(linePath.attr('stroke')).toBe(lineColor);
      expect(linePath.attr('stroke-width')).toBe(strokeWidth.toString());

      const expectedDataPoint = d3
        .line<{ valueTag: string; value: number }>()
        .x((dataItem) => xAxisScale(dataItem.valueTag) ?? 0)
        .y((dataItem) => yAxisScale(dataItem.value) ?? 0)(data);
      expect(linePath.attr('d')).toBe(expectedDataPoint);
    });

    it('should render multiple lines on chart svg', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      const dataSets = [
        [
          { valueTag: 'A', value: 10 },
          { valueTag: 'B', value: 20 },
          { valueTag: 'C', value: 15 },
        ],
        [
          { valueTag: 'A', value: 5 },
          { valueTag: 'B', value: 15 },
          { valueTag: 'C', value: 25 },
        ],
      ];
      const xAxisScale = d3.scalePoint<string>().domain(['A', 'B', 'C']).range([0, 100]);
      const yAxisScale = d3.scaleLinear().domain([0, 25]).range([100, 0]);
      const lineColors = ['red', 'blue'];
      const strokeWidth = 2;
      const classNames = ['line-red', 'line-blue'];
  
      dataSets.forEach((data, index) => {
        renderLine(chartSvg, data, xAxisScale, yAxisScale, lineColors[index], strokeWidth, classNames[index]);
      });
  
      const linePaths = chartSvg.selectAll('path').nodes();
  
      expect(linePaths.length).toBe(2);
  
      linePaths.forEach((linePath, index) => {
        const path = d3.select(linePath);
        expect(path.node()).toBeTruthy();
        expect(path.attr('fill')).toBe('none');
        expect(path.attr('stroke')).toBe(lineColors[index]);
        expect(path.attr('stroke-width')).toBe(strokeWidth.toString());
  
        const expectedDataPoint = d3
          .line<{ valueTag: string; value: number }>()
          .x((dataItem) => xAxisScale(dataItem.valueTag) ?? 0)
          .y((dataItem) => yAxisScale(dataItem.value) ?? 0)(dataSets[index]);
        expect(path.attr('d')).toBe(expectedDataPoint);
      });
  
    });
  });

  describe('render Bars', () => {

    const margin = { top: 10, right: 10, bottom: 10, left: 20 };
    const xAxisScale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const yAxisScale = d3.scaleBand<string>().domain(['A']).range([0, 100]).padding(0.1);

    it('should render a single bar on chart svg', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      const data = [
        { valueTag: 'A', value: 50, metric: 'metric1', selected: false },
      ];
      
      renderBars(chartSvg, data, xAxisScale, yAxisScale, margin);
  
      const barRect = chartSvg.select('rect');
  
      expect(barRect.node()).toBeTruthy();
      expect(barRect.attr('x')).toBe('20');
      expect(barRect.attr('x')).toBe(margin.left.toString());
      expect(Number(barRect.attr('width'))).toBe(100);
      expect(Number(barRect.attr('height'))).toBeCloseTo(56.94);
      expect(barRect.attr('fill')).toBe('purple');
    });

    it('should render multiple bars on chart svg', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      const data = [
        { valueTag: 'A', value: 50, metric: 'metric1' },
        { valueTag: 'A', value: 75, metric: 'metric2', selected: false },
        { valueTag: 'B', value: 25, metric: 'metric1', selected: false },
      ];
      const xAxisScale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
      const yAxisScale = d3.scaleBand<string>().domain(['A', 'B']).range([0, 100]).padding(0.1);
  
      renderBars(chartSvg, data, xAxisScale, yAxisScale, margin);
  
      const barRects = chartSvg.selectAll('rect').nodes();
  
      expect(barRects.length).toBe(3);
  
      const bar1 = d3.select(barRects[0]);
      expect(bar1.attr('x')).toBe(margin.left.toString());
      expect(Number(bar1.attr('width'))).toBeCloseTo(xAxisScale(50) - xAxisScale(0));
      expect(Number(bar1.attr('height'))).toBeCloseTo(8.367);
      expect(bar1.attr('fill')).toBe('purple');
  
      const bar2 = d3.select(barRects[1]);
      expect(bar2.attr('x')).toBe(margin.left.toString());
      expect(Number(bar2.attr('width'))).toBeCloseTo(xAxisScale(75) - xAxisScale(0));
      expect(Number(bar2.attr('height'))).toBeCloseTo(8.367);
      expect(bar2.attr('fill')).toBe('purple');
  
      const bar3 = d3.select(barRects[2]);
      expect(bar3.attr('x')).toBe(margin.left.toString());
      expect(Number(bar3.attr('width'))).toBeCloseTo(xAxisScale(25) - xAxisScale(0));
      expect(Number(bar3.attr('height'))).toBeCloseTo(8.367);
      expect(bar3.attr('fill')).toBe('purple');
    });

    it('should render a selected bar overlay', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      const data = [
        { valueTag: 'A', value: 75, metric: 'metric1', selected: true },
      ];
      const xAxisScale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
      const yAxisScale = d3.scaleBand<string>().domain(['A']).range([0, 100]).padding(0.1);
  
      renderBars(chartSvg, data, xAxisScale, yAxisScale, margin);
  
      const barRects = chartSvg.selectAll('rect').nodes();
  
      expect(barRects.length).toBe(2);
  
      const selectedBar = d3.select(barRects[1]);
  
      expect(selectedBar.style('fill')).toBe('none');
      expect(selectedBar.style('stroke')).toBe('black');
      expect(selectedBar.style('stroke-dasharray')).toBe('3, 3');
      expect(Number(selectedBar.attr('width'))).toBeCloseTo(xAxisScale(100) - xAxisScale(0) + margin.left);
      expect(Number(selectedBar.attr('height'))).toBeCloseTo(76.94);
    });

  });

  describe('render legend', () => {
    const width = 500;
    const margin = { top: 50, right: 20, bottom: 30, left: 40 };
    it('should render the legend correctly', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      
      const medianLineColor = 'red';
      const medianLineDash = '5, 5';
  
      renderLegend(chartSvg, width, margin, medianLineColor, medianLineDash);
  
      const legendGroup = chartSvg.select('g');
      const legendLine = legendGroup.select('line');
      const legendText = legendGroup.select('text');
  
      expect(legendGroup.attr('transform')).toBe(`translate(${margin.right + 20},${margin.top - 30})`);
  
      expect(legendLine.node()).toBeTruthy();
      expect(legendLine.attr('x1')).toBe('0');
      expect(legendLine.attr('x2')).toBe('40');
      expect(legendLine.attr('y1')).toBe('5');
      expect(legendLine.attr('y2')).toBe('5');
      expect(legendLine.attr('stroke')).toBe('purple');
      expect(legendLine.attr('stroke-width')).toBe('4');
  
      expect(legendText.node()).toBeTruthy();
      expect(legendText.attr('x')).toBe('50');
      expect(legendText.attr('y')).toBe('5');
      expect(legendText.text()).toBe('All types');
      expect(legendText.style('font-size')).toBe('14px');
      expect(legendText.attr('alignment-baseline')).toBe('middle');
    });

    it('should render the line legend', () => {
      const svg = d3.select(ref.current);
      const chartSvg = svg.append('g');
      const legendEntries = [
        { label: 'Line 1', colour: 'red' },
        { label: 'Line 2', colour: 'blue' },
        { label: 'Line 3', colour: 'green' },
      ];
      const size = 10;
      const width = 20;
      const margin = { top: 70, right: 30, bottom: 40, left: 120 };
  
      renderLineLegend(chartSvg, legendEntries, size, width, margin);
  
      const legendGroup = chartSvg.select('g');
      const legendItems = legendGroup.selectAll('.legend-item').nodes();
  
      expect(legendGroup.attr('transform')).toBe(`translate(${margin.left - 100}, ${margin.top - 60})`);
      expect(legendItems.length).toBe(legendEntries.length);
  
      legendItems.forEach((item, index) => {
        const legendItem = d3.select(item);
        const legendRect = legendItem.select('rect');
        const legendText = legendItem.select('text');
  
        expect(legendRect.attr('width')).toBe(width.toString());
        expect(legendRect.attr('height')).toBe(size.toString());
        expect(legendRect.attr('fill')).toBe(legendEntries[index].colour);
  
        expect(legendText.attr('x')).toBe((size + 50).toString());
        expect(legendText.attr('y')).toBe((size / 2).toString());
        expect(legendText.attr('dy')).toBe('0.35em');
        expect(legendText.text()).toBe(legendEntries[index].label);
  
        const expectedX = (index % 1) * 150;
        const expectedY = Math.floor(index / 1) * 25;
  
        expect(legendItem.attr('transform')).toBe(`translate(${expectedX}, ${expectedY})`);
      });
  
    });

  });

  describe('labels truncate', () => {
  
    it('should truncate labels longer than maxLength', () => {
      const label = 'This is a very long label';
      const maxLength = 10;
      const truncatedLabel = truncateLabels(label, maxLength);
      expect(truncatedLabel).toBe('This is a ...');
    });

    it('should not truncate labels shorter than maxLength', () => {
      const label = 'Short label';
      const maxLength = 20;
      const truncatedLabel = truncateLabels(label, maxLength);
      expect(truncatedLabel).toBe(label);
    });
    
    it('should not truncate labels equal to maxLength', () => {
      const label = 'EqualLength';
      const maxLength = 11;
      const truncatedLabel = truncateLabels(label, maxLength);
      expect(truncatedLabel).toBe(label);
    });

  });
  
});