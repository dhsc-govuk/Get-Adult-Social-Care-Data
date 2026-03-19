import { render, screen } from '@testing-library/react';
import CareProviderLocationsPage from '../../../app/(protected)/topics/residential-care/residential-care-providers/data/page';
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

describe('CareProviderLocationsPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<CareProviderLocationsPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Care provider services/i,
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

    const dataBoxHeadings = ['Number of adult social care providers'];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on care provision by service type and number of providers./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /Number of adult social care providers/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute(
      'href',
      '/help/total-number-community-social-care-providers'
    );

    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
  });
});
