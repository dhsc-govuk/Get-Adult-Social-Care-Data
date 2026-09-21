import { render, screen, waitFor } from '@testing-library/react';
import NumberAdultsReceivingCarePage from '../../../app/(protected)/topics/residential-care/number-of-people-receiving-care/data/page.tsx';
import { useSession, authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import LocationService from '@/services/location/locationService';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService', () => ({
  default: {
    getData: vi.fn(),
  },
}));
vi.mock('@/services/location/locationService', () => ({
  default: {
    getSelectedLocation: vi.fn(),
    getLocationNames: vi.fn(),
    getLocationIds: vi.fn(),
  },
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));
const mockUseSession = vi.mocked(useSession);
mockUseSession.mockReturnValue({ data: mockSession } as any);
const mockGetData = vi.mocked(IndicatorFetchService.getData);
const mockLocationService = vi.mocked(LocationService);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSession.mockReturnValue({ data: mockSession } as any);
  mockGetData.mockResolvedValue([]);
  mockLocationService.getSelectedLocation.mockResolvedValue('cp-1');
  mockLocationService.getLocationNames.mockResolvedValue({
    CPLabel: 'Provider 1',
    LALabel: 'Test LA',
    RegionLabel: 'Test Region',
    CountryLabel: 'England',
  } as any);
  // This page requests ids with the care provider included, so the shape is
  // [Indicator, provider_location_id, la_code, region_code, country_code].
  mockLocationService.getLocationIds.mockResolvedValue([
    'Indicator',
    'cp-1',
    'testla1',
    'region-1',
    'country-1',
  ]);
});

describe('NumberAdultsReceivingCarePage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<NumberAdultsReceivingCarePage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Number of adults receiving community social care/i,
      level: 1,
    });
    expect(mainHeading).toBeInTheDocument();

    const subHeadings = [
      'Data overview',
      'Data indicator details',
      'Information on the local care market',
    ];
    for (let subHeadingText of subHeadings) {
      expect(
        screen.getByRole('heading', { name: subHeadingText, level: 2 })
      ).toBeInTheDocument();
    }

    const dataBoxHeadings = [
      'Number of adults receiving community social care',
      'Number of adults receiving community social care – standardised per 100,000 of the total adult population (18+)',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on the number of people supported through community social care, including trends over time./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /Number of people receiving care/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute(
      'href',
      '/help/number-people-receiving-care-from-community-social-care-provider'
    );

    // One table per data box: the count and the standardised rate
    const tableElements = screen.getAllByRole('table');
    expect(tableElements).toHaveLength(2);
  });

  // Regression test for the MPS link being resolved from the wrong element of
  // the location id array. This page asks for ids *with* the care provider,
  // which shifts the LA code from index 1 to index 2, so reading index 1 passed
  // a provider location id to the MSP lookup and never matched an LA.
  it('should link to the market position statement for the LA, not the care provider', async () => {
    render(<NumberAdultsReceivingCarePage />);

    const mpsLink = await screen.findByRole('link', {
      name: 'Market Position Statement for Test LA (opens in new tab)',
    });
    expect(mpsLink).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/organisations/department-of-health-and-social-care'
    );

    expect(
      screen.queryByText(
        /We were unable to find a market position statement for the selected/
      )
    ).not.toBeInTheDocument();
  });

  it('should show the fallback text when the LA has no market position statement', async () => {
    mockLocationService.getLocationIds.mockResolvedValue([
      'Indicator',
      'cp-1',
      'not-an-la-code',
      'region-1',
      'country-1',
    ]);

    render(<NumberAdultsReceivingCarePage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /We were unable to find a market position statement for the selected/
        )
      ).toBeInTheDocument();
    });
  });
});
