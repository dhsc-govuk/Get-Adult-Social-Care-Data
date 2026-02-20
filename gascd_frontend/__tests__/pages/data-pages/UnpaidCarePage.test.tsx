import { render, screen } from '@testing-library/react';
import UnpaidCarePage from '../../../app/(protected)/topics/residential-care/unpaid-care/data/page';
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

describe('UnpaidCarePage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<UnpaidCarePage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Unpaid care/i,
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

    const dataBoxHeadings = ['People aged 5 and over who provide unpaid care'];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Statistics on the people who provide unpaid care to family members, friends and neighbours./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /People aged 5 and over who provide unpaid care/i,
    });
    expect(helpLink[1]).toBeInTheDocument();
    expect(helpLink[1]).toHaveAttribute(
      'href',
      '/help/percentage-people-aged-5-and-over-who-provide-unpaid-care'
    );

    const tables = [
      /Table 1: percentage of people aged 5 and over who provide unpaid care/i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
