import { render, screen, within } from '@testing-library/react';
import CQCRatingsPage from '../../../app/(protected)/topics/quality-of-care/cqc-ratings/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';
import { METRICS } from '@/config/metrics';
import {
  CQC_INSPECTION_STATUS_CATEGORIES,
  NUM_CQC_LOCATIONS,
} from '@/data/cqcMetrics';

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
    // The same help page is linked from both sections
    expect(
      screen.getAllByRole('link', {
        name: /how the number and percentage of inspected adult social care locations by CQC rating are calculated/i,
      })[0]
    ).toHaveAttribute(
      'href',
      '/help/cqc-ratings-of-adult-social-care-locations'
    );
  });

  it('shows the ratings by local authority below the ratings of the area', () => {
    render(<CQCRatingsPage />);

    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
        // Each set of tabs has a "Contents" heading of its own
        .filter((heading) => heading !== 'Contents')
    ).toEqual([
      'CQC ratings of inspected adult social care locations',
      'CQC ratings of inspected adult social care locations by local authority',
      'Inspection status of adult social care locations',
    ]);
    expect(
      screen.getByRole('table', {
        name: /Table 2: percentage of inspected adult social care locations rated Good/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', {
        name: /how the number and percentage of inspected adult social care locations by CQC rating are calculated/i,
      })[1]
    ).toHaveAttribute(
      'href',
      '/help/cqc-ratings-of-adult-social-care-locations'
    );
  });

  it('names the CQC as the source of each table and chart', () => {
    render(<CQCRatingsPage />);
    // Both of the first section's, the second's table (its chart has no
    // source line until its data has loaded) and the third's table
    expect(
      screen.getAllByText('Source: Care Quality Commission (CQC)')
    ).toHaveLength(4);
  });

  it('shows the table first in the first section, the chart first in the second and no chart in the third', () => {
    render(<CQCRatingsPage />);

    const tabs = screen
      .getAllByRole('link', { name: /^(Table|Chart|Download)$/ })
      .map((tab) => tab.textContent);
    expect(tabs).toEqual([
      'Table',
      'Chart',
      'Download',
      'Chart',
      'Table',
      'Download',
      'Table',
      'Download',
    ]);
  });

  it('shows the inspection status of locations below the ratings by local authority', () => {
    render(<CQCRatingsPage />);

    expect(
      within(
        screen.getByRole('table', {
          name: /Table 3: number and percentage of adult social care locations not yet inspected/i,
        })
      )
        .getAllByRole('rowheader')
        .map((row) => row.textContent)
    ).toEqual([
      ...CQC_INSPECTION_STATUS_CATEGORIES.map((category) => category.label),
      METRICS[NUM_CQC_LOCATIONS].label,
    ]);
    expect(
      screen.getByRole('link', {
        name: /how the inspection status of adult social care locations is calculated/i,
      })
    ).toHaveAttribute('href', METRICS[NUM_CQC_LOCATIONS].helpUrl);
    expect(
      screen.getByRole('link', {
        name: 'Export inspection status of adult social care locations table data (CSV)',
      })
    ).toBeInTheDocument();
  });

  it('lists every CQC rating as a table row, with the total last', () => {
    render(<CQCRatingsPage />);

    expect(
      within(
        screen.getByRole('table', {
          name: /Table 1: number and percentage of adult social care locations by CQC rating/i,
        })
      )
        .getAllByRole('rowheader')
        .map((row) => row.textContent)
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
