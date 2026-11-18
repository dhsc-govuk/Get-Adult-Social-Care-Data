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
      'Inspection status of adult social care locations by local authority',
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
    // Both of the first section's, the third's table, and the tables of the
    // second and fourth: their charts have no source line until their data
    // has loaded
    expect(
      screen.getAllByText(
        'Source: Care Directory from the Care Quality Commission (CQC)'
      )
    ).toHaveLength(5);
  });

  it('shows the table first in the first section, the chart first in the second and fourth and no chart in the third', () => {
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
      'Chart',
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
    // The same help page is linked from the section below
    for (const link of screen.getAllByRole('link', {
      name: /how the inspection status of adult social care locations is calculated/i,
    })) {
      expect(link).toHaveAttribute('href', METRICS[NUM_CQC_LOCATIONS].helpUrl);
    }
    expect(
      screen.getByRole('link', {
        name: 'Export inspection status of adult social care locations table data (CSV)',
      })
    ).toBeInTheDocument();
  });

  it('shows the inspection status by local authority last', () => {
    render(<CQCRatingsPage />);

    expect(
      screen.getByRole('table', {
        name: /Table 4: percentage of adult social care locations not yet inspected/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', {
        name: /how the inspection status of adult social care locations is calculated/i,
      })
    ).toHaveLength(2);
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
