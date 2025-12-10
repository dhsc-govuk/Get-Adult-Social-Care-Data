import { render, screen } from '@testing-library/react';
import DisabilityPrevalencePage from '../../../app/(protected)/topics/population-needs/disability-prevalence/data/page';
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

describe('DisabilityPrevalencePage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<DisabilityPrevalencePage />);

    const mainHeading = screen.getByRole('heading', {
      name: /General health, disability and learning disability/i,
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
      'Disability prevalence',
      'Learning disability prevalence',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', {
          name: dataBoxHeadingText,
          level: 3,
        })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on disability prevalence, learning disability diagnoses and reasons for accessing care./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /disability prevalence/,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute('href', '/help/disability-prevalence');

    const tables = [
      /Table 1: self-reporting on general health and disability – /i,
      /Table 2: learning disability prevalence – /i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
