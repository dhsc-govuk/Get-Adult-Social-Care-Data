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

  it('explains how NIs, RMs and invited users get access after a failed sign-in', () => {
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('heading', {
        name: /You do not have access to this service/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /If you are an NI or RM/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You get access automatically/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ask your provider's NI or RM to invite you/i)
    ).toBeInTheDocument();
  });

  it('links to the CQC website to find the NI or RM', () => {
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('link', {
        name: /find your provider on the CQC website/i,
      })
    ).toHaveAttribute('href', 'https://www.cqc.org.uk/search/services');
  });

  it('has no request access link', () => {
    render(<AccessDeniedPage />);

    expect(screen.queryByText(/request access/i)).not.toBeInTheDocument();
  });

  it('renders the ineligible variant without One Login advice for "Neither of these"', () => {
    params = new URLSearchParams('reason=ineligible');
    render(<AccessDeniedPage />);

    expect(
      screen.getByRole('heading', { name: /You cannot use this service/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /If you are an NI or RM/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Ask your provider's NI or RM to invite you/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /go back and choose CQC-registered care provider/i,
      })
    ).toHaveAttribute('href', '/whoami');
  });
});
