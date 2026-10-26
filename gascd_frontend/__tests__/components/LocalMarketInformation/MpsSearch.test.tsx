import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MpsSearch from '@/components/data-components/MpsSearch';
import AnalyticsService from '@/services/analytics/analyticsService';

vi.mock('@/helpers/msp/msp-lookup', () => ({
  MSPLookup: {
    E10000030: { url: 'https://www.surreycc.gov.uk/mps' },
    E06000030: { url: 'https://www.swindon.gov.uk/mps' },
  },
}));

const authorities = [
  { code: 'E06000030', display_name: 'Swindon' },
  { code: 'E10000030', display_name: 'Surrey' },
  { code: 'E06000066', display_name: 'Somerset' },
  { code: 'E08000035', display_name: 'Leeds' },
  { code: 'E06000014', display_name: 'York' },
  { code: 'E10000023', display_name: 'North Yorkshire' },
];

const openDetails = async () => {
  const summary = screen.getByText(
    'View a market position statement for another local authority'
  );
  const details = summary.closest('details') as HTMLDetailsElement;
  details.open = true;
  fireEvent(details, new Event('toggle'));
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/api/get_la_list')
  );
};

const input = () => screen.getByRole('combobox', { name: 'Local authority' });

describe('MpsSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ local_authorities: authorities }),
    } as Response);
    vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.spyOn(AnalyticsService, 'trackMPSClicked').mockImplementation(() => {});
  });

  it('only loads the list of LAs once it is opened', async () => {
    render(<MpsSearch />);
    expect(global.fetch).not.toHaveBeenCalled();
    await openDetails();
  });

  it('suggests LAs starting with what is typed, in order, without the user’s own LA', async () => {
    render(<MpsSearch excludeLaCode="E06000066" />);
    await openDetails();

    await waitFor(() => {
      fireEvent.change(input(), { target: { value: 's' } });
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Surrey', 'Swindon']);
    expect(screen.getByRole('status')).toHaveTextContent(
      '2 results are available'
    );
  });

  it('also suggests LAs with a later word starting with what is typed', async () => {
    render(<MpsSearch />);
    await openDetails();

    await waitFor(() => {
      fireEvent.change(input(), { target: { value: 'york' } });
      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(['York', 'North Yorkshire']);
    });
  });

  it('opens the chosen LA’s statement in a new tab', async () => {
    render(<MpsSearch />);
    await openDetails();

    await waitFor(() => {
      fireEvent.change(input(), { target: { value: 'sur' } });
      expect(screen.getByRole('option', { name: 'Surrey' })).toBeVisible();
    });
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Surrey' }));
    expect(input()).toHaveValue('Surrey');

    fireEvent.click(screen.getByRole('button', { name: /View statement/ }));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.surreycc.gov.uk/mps',
      '_blank',
      'noopener,noreferrer'
    );
    expect(AnalyticsService.trackMPSClicked).toHaveBeenCalledWith('E10000030');
  });

  it('can be used with the keyboard', async () => {
    render(<MpsSearch />);
    await openDetails();

    await waitFor(() => {
      fireEvent.change(input(), { target: { value: 'sw' } });
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(input()).toHaveAttribute(
      'aria-activedescendant',
      'mps-search-la-listbox-0'
    );
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(input()).toHaveValue('Swindon');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('asks for an LA when nothing is entered', async () => {
    render(<MpsSearch />);
    await openDetails();

    fireEvent.click(screen.getByRole('button', { name: /View statement/ }));
    expect(screen.getByText('Enter a local authority')).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('asks for an LA from the list when the text matches none', async () => {
    render(<MpsSearch />);
    await openDetails();

    fireEvent.change(input(), { target: { value: 'Atlantis' } });
    fireEvent.click(screen.getByRole('button', { name: /View statement/ }));
    expect(
      screen.getByText('Select a local authority from the list')
    ).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('says so when the LA has no statement', async () => {
    render(<MpsSearch />);
    await openDetails();

    await waitFor(() => {
      fireEvent.change(input(), { target: { value: 'Leeds' } });
      expect(screen.getByRole('option', { name: 'Leeds' })).toBeVisible();
    });
    fireEvent.click(screen.getByRole('button', { name: /View statement/ }));
    expect(
      screen.getByText(
        /We were unable to find a market position statement for Leeds/
      )
    ).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });
});
