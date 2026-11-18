import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import CqcLocationsSection from '@/components/data-components/CqcLocationsSection';
import CqcLocationService from '@/services/cqc-locations/cqcLocationService';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import LocationService from '@/services/location/locationService';
import { downloadCSV } from '@/helpers/downloadToCsvHelpers';
import {
  CQC_LOCATIONS_PAGE_SIZE,
  CQC_LOCATION_COLUMNS,
  CqcLocation,
  LA_FILTER,
  PROVIDER_FILTER,
  RATING_FILTER,
} from '@/data/cqcLocations';
import { CQC_RATINGS, SOURCES } from '@/config/metrics';
import { CQC_RATING_COLOURS } from '@/data/cqcMetrics';
import { Locations } from '@/data/interfaces/Locations';

vi.mock('@/services/analytics/analyticsService');
vi.mock('@/services/cqc-locations/cqcLocationService');
vi.mock('@/services/location/locationService');
vi.mock('@/helpers/downloadToCsvHelpers');
vi.mock('@/components/charts/peer-group/useAllLocalAuthorities');

const mockCqcLocations = vi.mocked(CqcLocationService);
const mockUseAllLocalAuthorities = vi.mocked(useAllLocalAuthorities);
const mockLocations = vi.mocked(LocationService);

const careProviderUser = {
  provider_id: '1-1',
  provider_name: 'Achieve Together Limited',
  la_code: 'E1',
  la_name: 'Mid Suffolk',
} as Locations;
const laUser = { la_code: 'E1', la_name: 'Mid Suffolk' } as Locations;

const location = (index: number): CqcLocation => ({
  code: `1-${index}`,
  name: `Location ${index}`,
  provider_code: '1-1',
  provider_name: 'Achieve Together Limited',
  service_types: ['adult_social_care', 'supported_living'],
  overall_rating: 'outstanding',
  rating_published: '2026-03-05',
});

// The data API's part: one page of the total, or all of it with no page size
const respondWith = (total: number) =>
  mockCqcLocations.getLocations.mockImplementation(async (query) => {
    const pageSize = Number(query.get('page_size')) || total;
    const start = (Number(query.get('page') ?? 1) - 1) * pageSize;
    return {
      data_month: '2026-10-01',
      total,
      locations: Array.from(
        { length: Math.min(pageSize, total - start) },
        (_, i) => location(start + i + 1)
      ),
    };
  });

const lastQuery = () => mockCqcLocations.getLocations.mock.lastCall![0];

const renderSection = () =>
  render(
    <CqcLocationsSection
      id="3"
      title="Inspected adult social care locations"
      intro={<p>Find out how</p>}
      tableNumber={2}
      download={{
        filename: 'inspected_locations.csv',
        description: 'inspected adult social care locations',
      }}
    />
  );

const tablePanel = () =>
  within(document.getElementById('table-3') as HTMLElement);
const downloadPanel = () =>
  within(document.getElementById('download-3') as HTMLElement);

const search = (panel: ReturnType<typeof within>, term: string) => {
  fireEvent.change(
    panel.getByRole('combobox', { name: 'Search by location name' }),
    { target: { value: term } }
  );
  fireEvent.click(panel.getByRole('button', { name: 'Search' }));
};

describe('CqcLocationsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockLocations.getLocations.mockResolvedValue(careProviderUser);
    mockCqcLocations.getProviders.mockResolvedValue([
      { code: '1-1', name: 'Achieve Together Limited' },
      { code: '1-2', name: 'Another Provider' },
    ]);
    mockUseAllLocalAuthorities.mockReturnValue({
      authorities: [
        { laCode: 'E1', laName: 'Mid Suffolk' },
        { laCode: 'E2', laName: 'Surrey' },
      ],
      error: false,
    });
    respondWith(3);
  });

  it('shows the published data label on both tabs and no chart', async () => {
    renderSection();
    await tablePanel().findByRole('table');

    expect(
      screen.getByRole('heading', {
        name: 'Inspected adult social care locations',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Published data')).toHaveLength(2);
    expect(
      screen.getAllByText('This data can be shared outside your organisation.')
    ).toHaveLength(2);
    expect(screen.queryByText('Chart')).not.toBeInTheDocument();
  });

  it("starts a care provider user on their care company's locations", async () => {
    renderSection();

    expect(
      await screen.findByText(
        'Table 2: CQC ratings and date of latest inspection of adult social care locations – Achieve Together Limited, all service types, all ratings, October 2026'
      )
    ).toBeInTheDocument();
    expect(lastQuery().getAll(PROVIDER_FILTER)).toEqual(['1-1']);
    expect(lastQuery().has(LA_FILTER)).toBe(false);
    // "All ratings" is every rating, leaving out locations not yet inspected
    expect(lastQuery().getAll(RATING_FILTER)).toEqual(Object.keys(CQC_RATINGS));
  });

  it('starts a local authority user on the locations in their LA', async () => {
    mockLocations.getLocations.mockResolvedValue(laUser);
    renderSection();

    expect(
      await screen.findByText(
        /– Mid Suffolk, all service types, all ratings, October 2026/
      )
    ).toBeInTheDocument();
    expect(lastQuery().getAll(LA_FILTER)).toEqual(['E1']);
    expect(lastQuery().has(PROVIDER_FILTER)).toBe(false);
  });

  it('shows each location with its rating colour and the date in full', async () => {
    renderSection();
    const table = await tablePanel().findByRole('table', {
      name: /Table 2: CQC ratings and date of latest inspection/,
    });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(Object.values(CQC_LOCATION_COLUMNS));
    const row = within(table).getByRole('row', { name: /Location 1/ });
    expect(row).toHaveTextContent('Achieve Together Limited');
    expect(row).toHaveTextContent('Supported living service');
    expect(row).toHaveTextContent('Outstanding');
    expect(row).toHaveTextContent('5 March 2026');
    expect(row.querySelector('.dhsc-category-key')).toHaveStyle({
      backgroundColor: CQC_RATING_COLOURS.outstanding,
    });
    expect(
      tablePanel().getByText(`Source: ${SOURCES.cqcCareDirectory}`)
    ).toBeInTheDocument();
  });

  it('has no pagination when the results fit on one page', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('moves between pages, keeping the filters and search', async () => {
    respondWith(CQC_LOCATIONS_PAGE_SIZE * 2 + 1);
    renderSection();
    await tablePanel().findByRole('table');
    search(tablePanel(), 'Location');
    await waitFor(() => expect(lastQuery().get('search')).toBe('Location'));

    expect(lastQuery().get('page')).toBe('1');
    expect(
      screen.queryByRole('link', { name: /Previous/ })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Next/ }));
    expect(await screen.findByText('Location 11')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(lastQuery().get('search')).toBe('Location');
    expect(lastQuery().getAll(PROVIDER_FILTER)).toEqual(['1-1']);

    fireEvent.click(screen.getByRole('link', { name: 'Page 3' }));
    expect(await screen.findByText('Location 21')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Next/ })
    ).not.toBeInTheDocument();
  });

  it('applies filters to the table and title, returning to the first page', async () => {
    respondWith(CQC_LOCATIONS_PAGE_SIZE + 1);
    renderSection();
    await tablePanel().findByRole('table');
    fireEvent.click(screen.getByRole('link', { name: /Next/ }));
    await waitFor(() => expect(lastQuery().get('page')).toBe('2'));

    fireEvent.click(tablePanel().getByRole('button', { name: 'Show filters' }));
    fireEvent.click(tablePanel().getByRole('checkbox', { name: 'Good' }));
    fireEvent.click(tablePanel().getByRole('checkbox', { name: 'Surrey' }));
    fireEvent.click(tablePanel().getByRole('button', { name: 'Apply' }));

    expect(
      await screen.findByText(
        /– Surrey, Achieve Together Limited, all service types, good, October 2026/
      )
    ).toBeInTheDocument();
    expect(lastQuery().getAll(RATING_FILTER)).toEqual(['good']);
    expect(lastQuery().getAll(LA_FILTER)).toEqual(['E2']);
    expect(lastQuery().get('page')).toBe('1');
  });

  it('shows all locations when the filters are cleared', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    fireEvent.click(tablePanel().getByRole('button', { name: 'Show filters' }));
    fireEvent.click(tablePanel().getByRole('button', { name: 'Clear all' }));

    expect(
      await screen.findByText(
        /– all locations, all service types, all ratings, October 2026/
      )
    ).toBeInTheDocument();
    expect(lastQuery().has(PROVIDER_FILTER)).toBe(false);
  });

  it('says when no locations match the search', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    respondWith(0);
    search(tablePanel(), 'nowhere');

    expect(
      await tablePanel().findByText(
        'No locations match your search. You can change your search or filters.'
      )
    ).toBeInTheDocument();
    expect(tablePanel().queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(
      downloadPanel().queryByRole('link', { name: /Export/ })
    ).not.toBeInTheDocument();
  });

  it('says when no locations match the filters', async () => {
    respondWith(0);
    renderSection();

    expect(
      await tablePanel().findByText(
        'No locations match your filters. You can change your search or filters.'
      )
    ).toBeInTheDocument();
    expect(tablePanel().queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows all locations in the filters again when the search is cleared', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    search(tablePanel(), 'beech');
    await waitFor(() => expect(lastQuery().get('search')).toBe('beech'));

    search(tablePanel(), '');
    await waitFor(() => expect(lastQuery().has('search')).toBe(false));
  });

  it('suggests matching locations as the user types and searches for the one selected', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    fireEvent.change(
      tablePanel().getByRole('combobox', { name: 'Search by location name' }),
      { target: { value: 'loc' } }
    );

    const option = await tablePanel().findByRole('option', {
      name: 'Location 2',
    });
    // The suggestions are within the applied filters
    expect(lastQuery().getAll(PROVIDER_FILTER)).toEqual(['1-1']);
    fireEvent.mouseDown(option);

    await waitFor(() => expect(lastQuery().get('search')).toBe('Location 2'));
    expect(
      tablePanel().getByRole('combobox', { name: 'Search by location name' })
    ).toHaveValue('Location 2');
  });

  it('has only the export link on the download tab', async () => {
    renderSection();
    await tablePanel().findByRole('table');

    expect(
      downloadPanel().getByRole('link', {
        name: 'Export inspected adult social care locations table data (CSV)',
      })
    ).toBeInTheDocument();
    expect(downloadPanel().queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      downloadPanel().queryByRole('button', { name: 'Show filters' })
    ).not.toBeInTheDocument();
  });

  it('downloads every matching location, with the filters, date and source', async () => {
    respondWith(CQC_LOCATIONS_PAGE_SIZE + 5);
    renderSection();
    await tablePanel().findByRole('table');
    search(tablePanel(), 'Location');
    await waitFor(() => expect(lastQuery().get('search')).toBe('Location'));

    fireEvent.click(
      downloadPanel().getByRole('link', {
        name: 'Export inspected adult social care locations table data (CSV)',
      })
    );

    await waitFor(() => expect(downloadCSV).toHaveBeenCalled());
    expect(lastQuery().has('page_size')).toBe(false);
    expect(lastQuery().get('search')).toBe('Location');
    const [rows, filename, , notice] = vi.mocked(downloadCSV).mock.lastCall!;
    expect(rows).toHaveLength(CQC_LOCATIONS_PAGE_SIZE + 5);
    expect(Object.keys(rows[0])).toEqual(Object.values(CQC_LOCATION_COLUMNS));
    expect(filename).toBe('inspected_locations.csv');
    expect(notice).toEqual([
      'Sharing label: Published data',
      'This data can be shared outside your organisation.',
      'CQC ratings and date of latest inspection of adult social care locations – Achieve Together Limited, all service types, all ratings, October 2026',
      'Location name search: Location',
      `Source: ${SOURCES.cqcCareDirectory}`,
    ]);
  });

  it('keeps the filters and search for the rest of the session', async () => {
    const { unmount } = renderSection();
    await tablePanel().findByRole('table');
    search(tablePanel(), 'beech');
    await waitFor(() => expect(lastQuery().get('search')).toBe('beech'));
    unmount();

    renderSection();
    await tablePanel().findByRole('table');
    expect(lastQuery().get('search')).toBe('beech');
    expect(
      tablePanel().getByRole('combobox', { name: 'Search by location name' })
    ).toHaveValue('beech');
  });

  it('says when the download could not be fetched, keeping the table', async () => {
    renderSection();
    await tablePanel().findByRole('table');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // The table's page still loads; the request for every location fails
    mockCqcLocations.getLocations.mockRejectedValue(new Error('failed'));
    expect(downloadPanel().getByRole('status')).toBeEmptyDOMElement();

    fireEvent.click(
      downloadPanel().getByRole('link', {
        name: 'Export inspected adult social care locations table data (CSV)',
      })
    );

    await waitFor(() =>
      expect(downloadPanel().getByRole('status')).toHaveTextContent(
        'The data could not be downloaded. Try again later.'
      )
    );
    expect(downloadCSV).not.toHaveBeenCalled();
    expect(tablePanel().getByRole('table')).toBeInTheDocument();
  });

  it('says when the care providers for the filters could not be loaded, keeping the table', async () => {
    mockCqcLocations.getProviders.mockRejectedValue(new Error('failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSection();

    expect(await tablePanel().findByRole('table')).toBeInTheDocument();
    expect(
      await tablePanel().findByText(
        'The list of care providers for the filters could not be loaded. Try again later.'
      )
    ).toBeInTheDocument();
  });

  it('says when the local authorities for the filters could not be loaded, keeping the table', async () => {
    mockUseAllLocalAuthorities.mockReturnValue({
      authorities: null,
      error: true,
    });
    renderSection();

    expect(await tablePanel().findByRole('table')).toBeInTheDocument();
    expect(
      tablePanel().getByText(
        'The list of local authorities for the filters could not be loaded. Try again later.'
      )
    ).toBeInTheDocument();
  });

  it('says nothing about the filter lists when they load', async () => {
    renderSection();
    await tablePanel().findByRole('table');

    expect(
      tablePanel().queryByText(/for the filters could not be loaded/)
    ).not.toBeInTheDocument();
  });

  it('says when the locations could not be loaded', async () => {
    mockCqcLocations.getLocations.mockRejectedValue(new Error('failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSection();

    expect(
      await tablePanel().findByText(
        'The locations could not be loaded. Try again later.'
      )
    ).toBeInTheDocument();
  });
});
