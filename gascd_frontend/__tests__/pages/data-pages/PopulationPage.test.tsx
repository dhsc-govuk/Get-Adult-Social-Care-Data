import { render, screen } from '@testing-library/react';
import PopulationPage from '../../../app/(protected)/topics/population-needs/population-age-and-size/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService');

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

    const dataBoxHeadings = ['Adult population size', 'Age group percentages'];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /NHS peer group and national levels for England./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getByRole('link', {
      name: 'population size',
    });
    expect(helpLink).toHaveAttribute('href', '/help/population-size');

    const ageHelpLink = screen.getByRole('link', {
      name: 'age group percentages',
    });
    expect(ageHelpLink).toHaveAttribute('href', '/help/population-age');

    const tables = [
      /Table 1: adult population size/i,
      /Table 2: age group percentages/i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
