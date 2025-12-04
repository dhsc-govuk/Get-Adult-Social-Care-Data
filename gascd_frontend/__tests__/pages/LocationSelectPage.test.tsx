import { render, screen } from '@testing-library/react';
import LocationSelectPage from '../../app/(onboarding)/location-select/page';
import { authClient } from '@/lib/auth-client';
import { mockSession } from '@/test-utils/test-utils';

vi.mock('@/services/logger/logService');
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));
const mockGetSession = vi.mocked(authClient.getSession);
mockGetSession.mockReturnValue({ data: mockSession } as any);

describe('LocationSelectPage', () => {
  it('should render the heading and some body text', () => {
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
