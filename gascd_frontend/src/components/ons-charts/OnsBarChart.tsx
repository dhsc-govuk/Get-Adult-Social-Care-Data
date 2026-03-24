import React, { useEffect } from 'react';

interface BarChartProps {
  caption: React.ReactNode;
  categories: string[];
  values: number[];
  highlightCategory: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  label?: string;
}

const OnsBarChart: React.FC<BarChartProps> = ({
  caption,
  categories = [],
  values = [],
  highlightCategory,
  yAxisLabel = '',
  xAxisLabel = '',
  label = '',
}) => {
  useEffect(() => {
    const barCharts = async () => {
      // Import this at page load time to avoid NextJS SSR errors
      // https://nextjs.org/docs/app/guides/lazy-loading#loading-external-libraries
      const HighchartsBaseChart = await import(
        '@ons/design-system/components/chart/chart'
      );

      [HighchartsBaseChart.default].forEach((Component) => {
        document
          .querySelectorAll(Component.selector())
          .forEach((el) => new Component(el));
      });
    };
    barCharts();
  }, [categories, values, highlightCategory]);

  const colors = ['#959495', '#1f6095'];

  let chartConfig = {
    chart: {
      type: 'bar',
    },
    colors,
    legend: {
      enabled: false,
    },
    yAxis: {
      title: {
        text: yAxisLabel,
        align: 'high',
      },
      labels: { format: '{value:,.0f}' },
    },
    xAxis: {
      title: {
        text: xAxisLabel,
        align: 'high',
      },
      categories: categories,
      type: 'category',
      labels: {
        useHTML: true,
      },
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '{y:,.0f}',
        },
        states: { inactive: { opacity: 1 } },
      },
    },
    series: [
      {
        name: label,
        data: values.map((val, i) => ({
          y: val,
          color: categories[i] === highlightCategory ? colors[1] : colors[0],
        })),
        marker: {
          enabled: false,
        },
        dataLabels: {
          enabled: true,
        },
        connectNulls: false,
        type: 'bar',
      },
    ],
  };

  return (
    <div
      data-highcharts-base-chart
      data-highcharts-type="bar"
      data-highcharts-theme="primary"
      data-highcharts-title={caption}
      data-highcharts-id="uuid"
      className="ons-scope"
    >
      <figure
        className="ons-chart"
        aria-describedby="chart-audio-description-uuid"
      >
        <h4 className="ons-chart__subtitle">{caption}</h4>
        <div
          data-highcharts-chart-container
          className="ons-chart__container ons-chart__gascd"
          role="region"
        >
          <div id="chart-instructions-uuid" className="ons-u-vh">
            Use the Tab key to move focus into the chart. Once inside, use the
            arrow keys to navigate between data points. As you move, tooltips
            will be announced to describe each point. Touch device users,
            explore by touch or with swipe gestures.
          </div>
          <div data-highcharts-chart className="ons-chart__chart"></div>
        </div>
      </figure>
      <script data-highcharts-config--uuid hidden>
        {JSON.stringify(chartConfig)}
      </script>
    </div>
  );
};

export default OnsBarChart;
