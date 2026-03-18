import { render, screen } from '@testing-library/react';
import LAFundingPage from '../../../app/(protected)/topics/(protected-la-metrics)/future-planning/la-funding-planning/data/page';
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

describe('LAFundingPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<LAFundingPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Population projections within local authorities/i,
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
      'Comparison of estimated population with selected needs over time',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data estimates on the prevalence of conditions that may require a social care response./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const asdHelpLink = screen.getAllByRole('link', {
      name: /People aged 18-64 predicted to have autistic spectrum disorders, projected to 2045/i,
    });

    expect(asdHelpLink[0]).toBeInTheDocument();
    expect(asdHelpLink[0]).toHaveAttribute(
      'href',
      '/help/estimated-population-asd'
    );

    const dementiaHelpLink = screen.getAllByRole('link', {
      name: /People aged 30-64 predicted to have early onset dementia, projected to 2045/i,
    });
    expect(dementiaHelpLink[0]).toBeInTheDocument();
    expect(dementiaHelpLink[0]).toHaveAttribute(
      'href',
      '/help/estimated-population-early-onset-dementia'
    );

    const learningDisabilityLink = screen.getAllByRole('link', {
      name: /People aged 18-64 with a learning disability, predicted to display challenging behaviour, projected to 2045/i,
    });
    expect(learningDisabilityLink[0]).toBeInTheDocument();
    expect(learningDisabilityLink[0]).toHaveAttribute(
      'href',
      '/help/estimated-population-learning-disability'
    );

    const tableElement = screen.getAllByRole('table');
    expect(tableElement[0]).toBeInTheDocument();
    expect(tableElement[1]).toBeInTheDocument();
  });
});
