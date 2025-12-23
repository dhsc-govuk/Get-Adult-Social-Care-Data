import { render, screen } from '@testing-library/react';
import LocationSelectPage from '../../app/(onboarding)/location-select/page';
import { authClient, useSession } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

global.fetch = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));
vi.mock('@/services/logger/logService');
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
  useSession: vi.fn(),
}));
const mockGetSession = vi.mocked(authClient.getSession);
mockGetSession.mockReturnValue({ data: mockSession } as any);
const mockUseSession = vi.mocked(useSession);
mockUseSession.mockReturnValue({ data: mockSession } as any);

describe('LocationSelectPage', () => {
  it('should render the heading and some body text', () => {
    const mockJsonResponse = [
      {
        metric_location_id: '1',
        metric_location_name: 'Location A',
      },
      {
        metric_location_id: '2',
        metric_location_name: 'Location B',
      },
    ];
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockJsonResponse),
    });

    render(<LocationSelectPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Select a location from your care provider group/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /We use the selected location to show you:/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const locationSelectInput = screen.getByRole('group', {
      name: /Select a location from your care provider group/i,
    });
    expect(locationSelectInput).toBeInTheDocument();
  });
});
