import { render, screen } from '@testing-library/react';
import DisabilityPrevalencePage from '../../../app/(protected)/topics/population-needs/disability-prevalence/data/page';
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

describe('DisabilityPrevalencePage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<DisabilityPrevalencePage />);

    const mainHeading = screen.getByRole('heading', {
      name: /General health and disability/i,
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
      'People who reported bad or very bad health',
      'Disability prevalence',
      'Learning disability prevalence',
      'Primary reason for people to access long-term adult social care',
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

    const disabilityHelpLink = screen.getByRole('link', {
      name: 'disability prevalence',
    });
    expect(disabilityHelpLink).toHaveAttribute(
      'href',
      '/help/disability-prevalence'
    );

    const learningDisabilityHelpLink = screen.getByRole('link', {
      name: 'learning disability prevalence is calculated',
    });
    expect(learningDisabilityHelpLink).toHaveAttribute(
      'href',
      '/help/learning-disability-prevalence'
    );

    const healthHelpLink = screen.getByRole('link', {
      name: 'people who reported bad or very bad health',
    });
    expect(healthHelpLink).toHaveAttribute(
      'href',
      '/help/people-who-reported-bad-or-very-bad-health'
    );

    const reasonHelpLink = screen.getAllByRole('link', {
      name: /Primary reason for people to access long-term adult social care/,
    });
    expect(reasonHelpLink[0]).toBeInTheDocument();
    expect(reasonHelpLink[0]).toHaveAttribute(
      'href',
      '/help/primary-reason-for-accessing-long-term-adult-social-care'
    );

    const tables = [
      /Table 1: people who reported bad or very bad health – /i,
      /Table 2: percentage of the population who reported a long-term physical or mental health condition/i,
      /Table 3: learning disability prevalence – /i,
      /Table 4: primary reason for /i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
