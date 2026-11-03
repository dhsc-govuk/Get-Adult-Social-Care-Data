import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import MarketPositionStatementsPage from '../../app/(protected)/market-position-statements/page';

vi.mock('@/helpers/msp/msp-lookup', () => ({
  MSPLookup: {
    E09000003: { url: 'https://www.barnet.gov.uk/mps' },
    E10000030: { url: 'https://www.surreycc.gov.uk/mps' },
  },
}));

describe('MarketPositionStatementsPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        local_authorities: [
          { code: 'E10000030', display_name: 'Surrey' },
          { code: 'E08000016', display_name: 'Barnsley' },
          { code: 'E09000003', display_name: 'Barnet' },
        ],
      }),
    } as Response);
  });

  it('lists every LA under its letter, linking those with a statement', async () => {
    render(<MarketPositionStatementsPage />);

    const b = await screen.findByRole('region', { name: 'B' });
    expect(
      within(b)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual([
      'Barnet (opens in new tab)',
      'BarnsleyNo market position statement found',
    ]);
    expect(
      within(b).getByRole('link', { name: /^Barnet/ })
    ).toHaveAttribute('href', 'https://www.barnet.gov.uk/mps');

    const s = screen.getByRole('region', { name: 'S' });
    expect(
      within(s).getByRole('link', { name: /^Surrey/ })
    ).toHaveAttribute('href', 'https://www.surreycc.gov.uk/mps');
  });

  it('links only to the letters that have LAs', async () => {
    render(<MarketPositionStatementsPage />);

    const contents = await screen.findByRole('navigation', {
      name: 'Contents',
    });
    expect(
      within(contents)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')])
    ).toEqual([
      ['B', '#letter-B'],
      ['S', '#letter-S'],
    ]);
  });

  it('has the search', async () => {
    render(<MarketPositionStatementsPage />);

    expect(
      screen.getByRole('combobox', { name: 'Search by local authority' })
    ).toBeInTheDocument();
  });
});
