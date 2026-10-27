import { render, screen } from '@testing-library/react';
import AccessDeniedPage from '../../app/(authentication)/access-denied/page';

let params = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn() })),
  useSearchParams: () => params,
}));

describe('AccessDeniedPage', () => {
  beforeEach(() => {
    params = new URLSearchParams();
  });

  it('renders the access-denied heading and One Login advice after a failed sign-in', () => {
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('heading', {
        name: /You cannot access this service/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Why you cannot access the service/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If you think you should have access/i)
    ).toBeInTheDocument();
  });

  it('renders the ineligible variant without One Login advice for "Neither of these"', () => {
    params = new URLSearchParams('reason=ineligible');
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('heading', { name: /You cannot use this service/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Why you cannot access the service/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/If you think you should have access/i)
    ).toBeInTheDocument();
  });
});
