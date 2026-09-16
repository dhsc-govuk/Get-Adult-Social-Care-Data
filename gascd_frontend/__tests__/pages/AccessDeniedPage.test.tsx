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
        name: /You do not have access to this service/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/logged into GOV.UK One Login with a different email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If you think you need access/i)
    ).toBeInTheDocument();
  });

  it('renders the ineligible variant without One Login advice for "Neither of these"', () => {
    params = new URLSearchParams('reason=ineligible');
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('heading', { name: /You cannot use this service/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/logged into GOV.UK One Login with a different email/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/If you think you need access/i)
    ).toBeInTheDocument();
  });
});
