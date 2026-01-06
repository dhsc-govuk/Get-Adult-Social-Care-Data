import { render, screen } from '@testing-library/react';
import ProvisionAndOccuplancyPage from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService');
vi.mock('@/services/location/LocationService');

// Mock out JS libraries that we are not testing here
vi.mock('../../../public/moj-frontend/js/moj-frontend.min.js');
vi.mock('../../../public/govuk-frontend/js/govuk-frontend.min.js');
vi.mock('react-plotly.js', () => ({
  default: vi.fn(),
}));

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

describe('ProvisionAndOccuplancyPage', () => {
  it('should render the heading, body text, and data tables', () => {
    render(<ProvisionAndOccuplancyPage />);

    const mainHeading = screen.getByRole('heading', {
      name: /Care home beds and occupancy levels/i,
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

    const dataBoxHeadings = ['Beds per care home and occupancy levels'];
    for (let dataBoxHeadingText of dataBoxHeadings) {
      expect(
        screen.getByRole('heading', {
          name: dataBoxHeadingText,
          level: 3,
        })
      ).toBeInTheDocument();
    }

    const bodyTextElement = screen.getByText(
      /Provision and capacity data for care homes, including local, regional and national statistics./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const helpLink = screen.getAllByRole('link', {
      name: /Adult social care beds per 100,000 adult population/,
    });
    expect(helpLink[0]).toBeInTheDocument();
    expect(helpLink[0]).toHaveAttribute(
      'href',
      '/help/beds-per-100000-adult-population'
    );

    const tables = [/Table 3: care home bed numbers and occupancy levels/i];
    for (let table of tables) {
      expect(screen.getByRole('table', { name: table })).toBeInTheDocument();
    }
  });
});
