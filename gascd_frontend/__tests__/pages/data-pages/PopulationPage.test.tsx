import { render, screen } from '@testing-library/react';
import PopulationPage from '../../../app/(protected)/topics/population-needs/population-age-and-size/data/page';
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
  },
}));
const mockGetSession = vi.mocked(authClient.getSession);
mockGetSession.mockReturnValue({ data: mockSession } as any);

describe('PopulationPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<PopulationPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Population size and age group percentages/i,
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
      'Adult population size with age group percentages',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Population data at district, local authority, regional and national levels for England./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /population size/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute('href', '/help/population-size');

    const tables = [/Table 1: population size and age group percentages/i];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
