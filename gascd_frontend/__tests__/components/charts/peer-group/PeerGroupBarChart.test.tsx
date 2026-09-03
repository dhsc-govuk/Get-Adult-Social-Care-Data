import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PeerGroupBarChart from '@/components/charts/PeerGroupBarChart';
import { PeerGroupData } from '@/components/charts/peer-group/types';

vi.mock('react-plotly.js', () => ({
  default: ({ data, layout }: { data: any[]; layout: any }) => (
    <div data-testid="plotly-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-layout">{JSON.stringify(layout)}</div>
    </div>
  ),
}));

const peerData: PeerGroupData = {
  localAuthorityPeers: [
    {
      code: 'E08000018',
      displayName: 'Sheffield',
      peerRanking: 1,
      metricValue: 55.5,
    },
    {
      code: 'E08000015',
      displayName: 'Manchester',
      peerRanking: 2,
      metricValue: 51.5,
    },
  ],
  averagePeerGroup: 53.5,
  nationalAverage: 10.5,
};

const defaultProps = {
  laCode: 'E08000014',
  laName: 'Liverpool',
  currentLaValue: 52.5,
  nationalAverageValue: 10.5,
  peerData,
  loading: false,
  error: false,
};

describe('PeerGroupBarChart', () => {
  it('shows a loading state before the LA code resolves', () => {
    render(<PeerGroupBarChart {...defaultProps} laCode="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows a loading state while data is fetching, keeping the comparator control visible', () => {
    render(
      <PeerGroupBarChart
        {...defaultProps}
        peerData={null}
        loading
        comparatorControl={<div data-testid="comparator-control" />}
      />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('comparator-control')).toBeInTheDocument();
  });

  it('shows an error state, keeping the comparator control visible', () => {
    render(
      <PeerGroupBarChart
        {...defaultProps}
        peerData={null}
        error
        comparatorControl={<div data-testid="comparator-control" />}
      />
    );
    expect(screen.getByText('Data not available')).toBeInTheDocument();
    expect(screen.getByTestId('comparator-control')).toBeInTheDocument();
  });

  it('renders the chart with the default NHS labels', () => {
    render(<PeerGroupBarChart {...defaultProps} />);
    expect(
      screen.getByText(
        /This chart compares Liverpool with its NHS Peer Group for/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NHS peer group average \(53\.5%\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/England \(national average\) \(10\.5%\)/i)
    ).toBeInTheDocument();
  });

  it('renders custom comparator labels in the summary and legend', () => {
    render(
      <PeerGroupBarChart
        {...defaultProps}
        comparatorLabel="My custom group"
        comparatorAverageLabel="My custom group average"
      />
    );
    expect(
      screen.getByText(
        /This chart compares Liverpool with My custom group for/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/My custom group average \(53\.5%\)/i)
    ).toBeInTheDocument();
  });

  it("keeps the user's own LA highlighted and sorts values descending", () => {
    render(<PeerGroupBarChart {...defaultProps} />);
    const chartData = JSON.parse(
      screen.getByTestId('chart-data').textContent ?? '[]'
    );
    // Liverpool's tick label is bolded via the highlight
    expect(chartData[0].y).toEqual([
      'Sheffield',
      '<b>Liverpool</b>',
      'Manchester',
    ]);
  });

  it('renders one bar per LA name when a peer appears under two codes', () => {
    // e.g. an LA present under both its old and new ONS code. Plotly merges
    // bars that share a tick label, which would desynchronise the highlight
    // shape's index from the axis and render blank rows below the bars.
    const dataWithRecodedPeer: PeerGroupData = {
      ...peerData,
      localAuthorityPeers: [
        ...peerData.localAuthorityPeers,
        {
          code: 'E08000038',
          displayName: 'Sheffield',
          peerRanking: 3,
          metricValue: 41.5,
        },
      ],
    };
    render(<PeerGroupBarChart {...defaultProps} peerData={dataWithRecodedPeer} />);
    const chartData = JSON.parse(
      screen.getByTestId('chart-data').textContent ?? '[]'
    );
    // The higher-valued Sheffield entry survives; every label is unique
    expect(chartData[0].y).toEqual([
      'Sheffield',
      '<b>Liverpool</b>',
      'Manchester',
    ]);
    expect(chartData[0].x).toEqual([55.5, 52.5, 51.5]);
  });

  it("dedupes the user's own LA out of the peer rows by code", () => {
    const dataWithOwnLa: PeerGroupData = {
      ...peerData,
      localAuthorityPeers: [
        ...peerData.localAuthorityPeers,
        {
          code: 'E08000014',
          displayName: 'Liverpool',
          peerRanking: 3,
          metricValue: 52.5,
        },
      ],
    };
    render(<PeerGroupBarChart {...defaultProps} peerData={dataWithOwnLa} />);
    const chartData = JSON.parse(
      screen.getByTestId('chart-data').textContent ?? '[]'
    );
    expect(chartData[0].y).toEqual([
      'Sheffield',
      '<b>Liverpool</b>',
      'Manchester',
    ]);
  });

  it('never falls back to the peers API national average, so the chart matches the table', () => {
    render(
      <PeerGroupBarChart
        {...defaultProps}
        nationalAverageValue={null}
        peerData={{ ...peerData, nationalAverage: 40.7 }}
      />
    );
    expect(screen.queryByText(/40\.7%/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/England \(national average\) \(N\/A\)/i)
    ).toBeInTheDocument();
  });

  it('shows unavailable rather than peer bars when the LA value is missing for this metric', () => {
    // Peer data resolved but the base metric-data response had no row (or a
    // null value) for the user's LA for this one metric
    render(<PeerGroupBarChart {...defaultProps} currentLaValue={null} />);
    expect(screen.getByText('Data not available')).toBeInTheDocument();
    expect(screen.queryByText(/Sheffield/)).not.toBeInTheDocument();
    expect(screen.queryByText(/national average/i)).not.toBeInTheDocument();
  });

  it('shows the unavailable message when there are no peers', () => {
    render(
      <PeerGroupBarChart
        {...defaultProps}
        peerData={{
          localAuthorityPeers: [],
          averagePeerGroup: null,
          nationalAverage: null,
        }}
      />
    );
    expect(
      screen.getByText('This chart is not available to your Local Authority.')
    ).toBeInTheDocument();
  });
});
