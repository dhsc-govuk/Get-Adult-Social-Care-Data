import { render, screen } from '@testing-library/react';
import CQCRatingsPage from '../../../app/(protected)/topics/quality-of-care/cqc-ratings/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService');
vi.mock('react-plotly.js', () => ({ default: () => <div /> }));

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

describe('CQCRatingsPage', () => {
  it('should render the heading, body text and section headings', () => {
    render(<CQCRatingsPage />);

    expect(
      screen.getByRole('heading', {
        name: /CQC ratings of adult social care locations/i,
        level: 1,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Data on CQC ratings of adult social care locations, including number and percentage of locations by CQC rating, number and percentage not yet inspected, and date of latest inspection./i
      )
    ).toBeInTheDocument();

    const subHeadings = [
      'Data overview',
      'Data indicator details',
      'Related data',
      'Information on the local care market',
    ];
    for (const subHeadingText of subHeadings) {
      expect(
        screen.getByRole('heading', { name: subHeadingText, level: 2 })
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole('heading', {
        name: 'CQC ratings of inspected adult social care locations',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', {
        name: /Table 1: number and percentage of adult social care locations by CQC rating/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /how the percentage of inspected adult social care locations by CQC rating is calculated/i,
      })
    ).toHaveAttribute(
      'href',
      '/help/cqc-ratings-of-adult-social-care-locations'
    );
  });

  it('names the CQC as the source of the table and chart', () => {
    render(<CQCRatingsPage />);
    expect(
      screen.getAllByText('Source: Care Quality Commission (CQC)')
    ).toHaveLength(2);
  });

  it('shows the table first, then the chart, then the download', () => {
    render(<CQCRatingsPage />);

    const tabs = screen
      .getAllByRole('link', { name: /^(Table|Chart|Download)$/ })
      .map((tab) => tab.textContent);
    expect(tabs).toEqual(['Table', 'Chart', 'Download']);
  });

  it('lists every CQC rating as a table row, with the total last', () => {
    render(<CQCRatingsPage />);

    expect(
      screen.getAllByRole('rowheader').map((row) => row.textContent)
    ).toEqual([
      'Outstanding',
      'Good',
      'Requires improvement',
      'Inadequate',
      'Insufficient evidence to rate',
      'All inspected locations',
    ]);
  });

  it('should link back to the Quality of care topic', () => {
    render(<CQCRatingsPage />);

    expect(
      screen.getByRole('link', { name: /^Quality of care$/i })
    ).toHaveAttribute('href', '/topics/quality-of-care/subtopics');
  });
});
