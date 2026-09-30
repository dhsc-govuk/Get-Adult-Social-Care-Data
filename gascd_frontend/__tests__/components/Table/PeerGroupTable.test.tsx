import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
  it("lists the chart's rows and the averages, highest value first", () => {
    render(<PeerGroupTable {...props} />);
    expect(bodyRows()).toEqual([
      ['Sheffield', '55.5'],
      ['NHS peer group (average)', '53.5'],
      ['Liverpool', '52.5'],
      ['Manchester', '51.5'],
      ['North West (regional average)', '48.5'],
      ['England (national average)', '10.5'],
    ]);
  });

  it('keeps sorting highest first when the rows change', () => {
    const { rerender } = render(<PeerGroupTable {...props} />);
    rerender(
      <PeerGroupTable
        {...props}
        peerData={{
          ...peerData,
          localAuthorityPeers: [
            {
              code: 'E08000020',
              displayName: 'Bolton',
              peerRanking: 1,
              metricValue: 60,
            },
          ],
          averagePeerGroup: 60,
        }}
      />
    );
    expect(bodyRows().map(([area]) => area)).toEqual([
      'Bolton',
      'NHS peer group (average)',
      'Liverpool',
      'North West (regional average)',
      'England (national average)',
    ]);
  });

  it('sorts by area or by value from the column headings', () => {
    render(<PeerGroupTable {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Area/ }));
    expect(bodyRows().map(([area]) => area)).toEqual([
      'England (national average)',
      'Liverpool',
      'Manchester',
      'NHS peer group (average)',
      'North West (regional average)',
      'Sheffield',
    ]);
    expect(screen.getByRole('columnheader', { name: /Area/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    // Back to the value column: highest first, then flip to lowest first
    const valueButton = screen.getByRole('button', {
      name: /Beds per 100,000/,
    });
    fireEvent.click(valueButton);
    expect(bodyRows()[0][1]).toBe('55.5');
    fireEvent.click(valueButton);
    expect(bodyRows().map(([, value]) => value)).toEqual([
      '10.5',
      '48.5',
      '51.5',
      '52.5',
      '53.5',
      '55.5',
    ]);
  });

  it('sorts extra rows with the rest and formats currency', () => {
    render(
      <PeerGroupTable
        {...props}
        valueFormat="currency"
        extraRows={[{ label: 'My care home', value: 1234.4 }]}
      />
    );
    expect(bodyRows()[0]).toEqual(['My care home', '£1,234']);
  });

  it('shows N/A for a missing average, sorted last', () => {
    render(<PeerGroupTable {...props} regionalAverageValue={null} />);
    expect(bodyRows().at(-1)).toEqual(['North West (regional average)', 'N/A']);
  });

  it('keeps the LA and averages while the peers load or when they fail', () => {
    const { rerender } = render(
      <PeerGroupTable {...props} peerData={null} loading />
    );
    expect(bodyRows()).toEqual([
      ['Liverpool', '52.5'],
      ['North West (regional average)', '48.5'],
      ['England (national average)', '10.5'],
      ['NHS peer group (average)', 'Loading...'],
    ]);
    rerender(<PeerGroupTable {...props} peerData={null} />);
    expect(bodyRows().at(-1)).toEqual(['NHS peer group (average)', 'N/A']);
  });
});
