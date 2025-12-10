import { render, screen } from '@testing-library/react';
import EconomicFactorsPage from '../../../app/(protected)/topics/population-needs/household-composition-and-economic-factors/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService');
vi.mock('@/services/location/LocationService');

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
    useSession: vi.fn(),
  },
}));
const mockGetSession = vi.mocked(authClient.getSession);
const mockUseSession = vi.mocked(authClient.useSession);
mockGetSession.mockReturnValue({ data: mockSession } as any);
mockUseSession.mockReturnValue({ data: mockSession } as any);

describe('EconomicFactorsPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<EconomicFactorsPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Economic factors and household composition/i,
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
      'Household deprivation',
      'Households where the property is owned outright',
      'One-person households where the person is aged 65 or over',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on household deprivation, property ownership and older people living alone./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /household deprivation/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute('href', '/help/household-deprivation');

    const tables = [
      /Table 1: percentage of households classified as/i,
      /Table 2: percentage of households where the property is owned outright/i,
      /Table 3: percentage of one-person households where the person is aged 65 or over/i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
