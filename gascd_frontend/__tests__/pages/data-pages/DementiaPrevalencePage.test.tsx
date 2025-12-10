import { render, screen } from '@testing-library/react';
import DementiaPrevalencePage from '../../../app/(protected)/topics/population-needs/dementia-prevalence/data/page';
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

describe('DementiaPrevalencePage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<DementiaPrevalencePage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Dementia prevalence and estimated diagnosis rate/i,
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
      'Dementia prevalence and estimated diagnosis rate',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on registered dementia diagnoses with estimates for undiagnosed dementia./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /dementia prevalence/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute('href', '/help/dementia-prevalence');
    expect(helpLink[1]).toBeInTheDocument();
    expect(helpLink[1]).toHaveAttribute('href', '/help/dementia-prevalence');

    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
  });
});
