import { render, screen } from '@testing-library/react';
import LAFundingPage from '../../../app/(protected)/topics/financial-spend-and-unpaid-care/financial-spend/data/page';
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

describe('LAFundingPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<LAFundingPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /funding for adult social care/i,
      level: 1,
    });
    expect(mainHeading).toBeInTheDocument();

    const subHeadings = [
      'Data overview',
      'Trends',
      'Data indicator details',
      'Information on the local care market',
    ];
    for (let subHeadingText of subHeadings) {
      expect(
        screen.getByRole('heading', { name: subHeadingText, level: 2 })
      ).toBeInTheDocument();
    }

    const dataBoxHeadings = [
      'LA adult social care funding by duration of care',
      'LA funding for long-term adult social care',
      'LA funding for long-term adult social care – trends over time',
    ];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', { name: dataBoxHeadingText, level: 3 })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Data on funding for both short-term and long-term care, also funding by individual care type./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /LA funding for adult social care/i,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute(
      'href',
      '/help/total-financial-spend-adult-social-care'
    );

    const tables = [
      /Table 1: LA spending on short-term and long-term adult social care for all age groups/i,
      /Table 2: LA funding for long-term adult social care for all age groups /i,
      /Table 3: LA funding for long-term adult social care (all types of adult social care) for all age groups/i,
    ];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
