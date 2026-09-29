import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import PeerGroupTable from '@/components/tables/PeerGroupTable';
import { PeerGroupData } from '@/components/charts/peer-group/types';

const peerData: PeerGroupData = {
  localAuthorityPeers: [
    {
      code: 'E08000015',
      displayName: 'Manchester',
      peerRanking: 2,
      metricValue: 51.5,
    },
    {
      code: 'E08000018',
      displayName: 'Sheffield',
      peerRanking: 1,
      metricValue: 55.5,
    },
    // The user's own LA, as a custom group can include it
    {
      code: 'E08000014',
      displayName: 'Liverpool',
      peerRanking: 3,
      metricValue: 52.5,
    },
    // Suppressed, so the chart has no bar for it
    {
      code: 'E08000019',
      displayName: 'Leeds',
      peerRanking: 4,
      metricValue: null,
    },
  ],
  averagePeerGroup: 53.5,
  nationalAverage: 99,
};

const props = {
  source: 'Test source',
  valueHeader: 'Beds per 100,000',
  laCode: 'E08000014',
  laName: 'Liverpool',
  currentLaValue: 52.5,
  peerData,
  loading: false,
  regionalAverageLabel: 'North West (regional average)',
  regionalAverageValue: 48.5,
  nationalAverageValue: 10.5,
};

const bodyRows = () =>
  within(screen.getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((row) => [
      within(row).getByRole('rowheader').textContent,
      within(row).getByRole('cell').textContent,
    ]);

describe('PeerGroupTable', () => {
  it("lists the chart's rows in the chart's order, then the averages", () => {
    render(<PeerGroupTable {...props} />);
    expect(bodyRows()).toEqual([
      ['Sheffield', '55.5'],
      ['Liverpool', '52.5'],
      ['Manchester', '51.5'],
      ['NHS peer group (average)', '53.5'],
      ['North West (regional average)', '48.5'],
      ['England (national average)', '10.5'],
    ]);
  });

  it('puts extra rows first and formats currency', () => {
    render(
      <PeerGroupTable
        {...props}
        valueFormat="currency"
        extraRows={[{ label: 'My care home', value: 1234.4 }]}
      />
    );
    expect(bodyRows()[0]).toEqual(['My care home', '£1,234']);
  });

  it('shows N/A for a missing average', () => {
    render(<PeerGroupTable {...props} regionalAverageValue={null} />);
    expect(bodyRows()[4]).toEqual(['North West (regional average)', 'N/A']);
  });

  it('keeps the LA and averages while the peers load or when they fail', () => {
    const { rerender } = render(
      <PeerGroupTable {...props} peerData={null} loading />
    );
    expect(bodyRows()).toEqual([
      ['Liverpool', '52.5'],
      ['NHS peer group (average)', 'Loading...'],
      ['North West (regional average)', '48.5'],
      ['England (national average)', '10.5'],
    ]);
    rerender(<PeerGroupTable {...props} peerData={null} />);
    expect(bodyRows()[1]).toEqual(['NHS peer group (average)', 'N/A']);
  });
});
