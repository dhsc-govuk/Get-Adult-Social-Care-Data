import { render, screen, waitFor } from '@testing-library/react';
import ProvisionAndOccupancyPage from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/data/page';
import {
  initializeAppInsights,
  resetAppInsights,
  getAppInsights,
} from '@/components/analytics/appInsights';
import { TEST_CONNECTION_STRING } from '../../services/analytics/AnalyticsService.test';
import { useSession } from '@/lib/auth-client';
import { mockSession, mockSessionLAUser } from '@/test-utils/test-utils';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import LocationService from '@/services/location/locationService';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/components/tables/VerticalLocationTable');
vi.mock('@/services/indicator/IndicatorFetchService', () => ({
  default: {
    getData: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock('@/services/location/locationService', () => ({
  default: {
    getSelectedLocation: vi.fn(),
    getLocationNames: vi.fn(),
    getLocationIds: vi.fn(),
    getLasForRegion: vi.fn(),
  },
}));
vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

// Mock out JS libraries that we are not testing here
vi.mock('react-plotly.js', () => ({
  default: vi.fn(),
}));

const mockUseSession = vi.mocked(useSession);
const mockGetData = vi.mocked(IndicatorFetchService.getData);
const mockLocationService = vi.mocked(LocationService);

const mockResidentialUser = {
  ...mockSession.user,
  selectedLocationCategory: 'residential',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSession.mockReturnValue({ data: mockSession } as any);
  mockGetData.mockResolvedValue([]);
  (mockLocationService.getSelectedLocation as vi.mock).mockResolvedValue(
    'cp-1'
  );
  (mockLocationService.getLocationNames as vi.mock).mockResolvedValue({
    CPLabel: 'Provider 1',
    LALabel: 'Test LA',
    RegionLabel: 'Test Region',
    CountryLabel: 'England',
  });
  (mockLocationService.getLocationIds as vi.mock).mockResolvedValue([
    'Indicator',
    'la-1',
    'region-1',
    'country-1',
  ]);
  (mockLocationService.getLasForRegion as vi.mock).mockResolvedValue([
    { la_code: 'la-1', la_name: 'Test LA' },
  ]);
});

describe('ProvisionAndOccupancyPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<ProvisionAndOccupancyPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Care home beds and occupancy levels/i,
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

    const dataBoxHeadings = ['Beds per care home and occupancy levels'];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', {
          name: dataBoxHeadingText,
          level: 3,
        })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Provision and capacity data for care homes, including local, regional and national statistics./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /Adult social care beds per 100,000 adult population/,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute(
      'href',
      '/help/beds-per-100000-adult-population'
    );

    const tables = [/Table 3: care home bed numbers and occupancy levels/i];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});

describe('ProvisionAndOccupancyPage', () => {
  beforeAll(() => {
    initializeAppInsights(TEST_CONNECTION_STRING);
  });

  afterAll(() => {
    resetAppInsights();
  });

  it('should track the correct metric events', () => {
    const appInsights = getAppInsights() as any;
    const insightSpy = vi.spyOn(appInsights, 'trackEvent');

    render(<ProvisionAndOccupancyPage />);

    const expected_metrics = [
      'occupancy_rate_total',
      'median_bed_count_total',
      'median_occupancy_total',
      'bedcount_per_hundred_thousand_adults_total',
    ];

    expect(insightSpy).toHaveBeenCalledTimes(expected_metrics.length);
    expected_metrics.forEach((metric_id) => {
      const expected_event = {
        name: 'metric-view',
        properties: {
          metric_id: metric_id,
        },
      };
      expect(insightSpy).toHaveBeenCalledWith(expected_event);
    });
  });

  it('should track the correct metric events for residential CP users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: mockResidentialUser,
      },
    } as any);
    const appInsights = getAppInsights() as any;
    const insightSpy = vi.spyOn(appInsights, 'trackEvent');

    render(<ProvisionAndOccupancyPage />);

    const expected_metrics = [
      'bedcount_total',
      'occupancy_rate_total',
      'median_bed_count_total',
      'median_occupancy_total',
      'bedcount_per_hundred_thousand_adults_total',
    ];

    expected_metrics.forEach((metric_id) => {
      const expected_event = {
        name: 'metric-view',
        properties: {
          metric_id: metric_id,
        },
      };
      expect(insightSpy).toHaveBeenCalledWith(expected_event);
    });
    expect(insightSpy).toHaveBeenCalledTimes(expected_metrics.length);
  });

  it('omits bedcount_total from the care provider fetch when CP-level data is hidden', async () => {
    mockUseSession.mockReturnValue({ data: mockSessionLAUser } as any);

    render(<ProvisionAndOccupancyPage />);

    await waitFor(() => expect(mockGetData).toHaveBeenCalled());

    const queriedMetricIds = mockGetData.mock.calls.map(
      ([query]) => query.metric_ids
    );

    expect(queriedMetricIds).toContainEqual(['occupancy_rate_total']);
    expect(queriedMetricIds).not.toContainEqual(
      expect.arrayContaining(['bedcount_total', 'occupancy_rate_total'])
    );
  });

  it('includes bedcount_total in the care provider fetch when CP-level data is shown', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: mockResidentialUser,
      },
    } as any);

    render(<ProvisionAndOccupancyPage />);

    await waitFor(() => expect(mockGetData).toHaveBeenCalled());

    const queriedMetricIds = mockGetData.mock.calls.map(
      ([query]) => query.metric_ids
    );

    expect(queriedMetricIds).toContainEqual([
      'bedcount_total',
      'occupancy_rate_total',
    ]);
  });
});
