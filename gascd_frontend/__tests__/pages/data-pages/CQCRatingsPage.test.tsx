import { render, screen } from '@testing-library/react';
import CQCRatingsPage from '../../../app/(protected)/topics/quality-of-care/cqc-ratings/data/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

// Mock out things we are not testing at the moment to prevent them making api requests
vi.mock('@/components/common/buttons/logoutButton');
vi.mock('@/services/logger/logService');

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
      'Information on the local care market',
    ];
    for (const subHeadingText of subHeadings) {
      expect(
        screen.getByRole('heading', { name: subHeadingText, level: 2 })
      ).toBeInTheDocument();
    }
  });

  it('should link back to the Quality of care topic', () => {
    render(<CQCRatingsPage />);

    expect(
      screen.getByRole('link', { name: /^Quality of care$/i })
    ).toHaveAttribute('href', '/topics/quality-of-care/subtopics');
  });
});
