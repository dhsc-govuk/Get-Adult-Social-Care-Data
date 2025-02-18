'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Define label structure
interface Labels {
  age: string;
  weight: string;
  height: string;
}

interface DataItem {
  age: number;
  weight: number;
  height: number;
}

interface DataSet {
  [key: string]: DataItem;
}

const GraphTest: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const labelData: Labels = {
      age: "Person's Age",
      weight: "Person's Weight",
      height: "Person's Height",
    };

    const data: DataSet = {
      obj1: { age: 50, weight: 200, height: 180 },
      obj2: { age: 60, weight: 220, height: 175 },
      obj3: { age: 40, weight: 180, height: 170 },
    };

    const width: number = 640;
    const height: number = 400;
    const marginTop: number = 20;
    const marginRight: number = 20;
    const marginBottom: number = 30;
    const marginLeft: number = 40;

    const xLabels = Object.keys(labelData);

    const transformedData = xLabels.map((key) => ({
      category: key,
      values: Object.values(data).map((d) => d[key as keyof DataItem]),
    }));

    const maximumValue = d3.max(transformedData.flatMap((d) => d.values)) || 0;

    const x = d3
      .scaleBand()
      .domain(xLabels)
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, maximumValue])
      .nice()
      .range([height - marginBottom, marginTop]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickFormat((d) => labelData[d as keyof Labels]));

    svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y));

    xLabels.forEach((category, i) => {
      svg
        .selectAll(`.bar-${category}`)
        .data(transformedData[i].values)
        .enter()
        .append('rect')
        .attr('class', `bar-${category}`)
        .attr('x', (idx) => x(category) ?? 0 + idx * (x.bandwidth() / 4))
        .attr('y', (d) => y(d))
        .attr('width', x.bandwidth() / 4)
        .attr('height', (d) => height - marginBottom - y(d))
        .attr('fill', d3.schemeCategory10[i]);
    });
  }, []);

  return (
    <div>
      <h2>Graph</h2>
      <svg ref={svgRef} width={640} height={400}></svg>
    </div>
  );
};

export default GraphTest;
