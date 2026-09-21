import { render, screen } from '@testing-library/react';
import SignupLAPage from '../../../app/(onboarding-la)/signup-la/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: vi.fn() })),
  useSearchParams: () => new URLSearchParams(),
}));

const renderPage = async (params: { error?: string }) =>
  render(await SignupLAPage({ searchParams: Promise.resolve(params) }));

describe('SignupLAPage', () => {
  it('describes a failed pre-check when reached from the lookup page', async () => {
    await renderPage({});
    expect(
      screen.getByRole('heading', {
        name: /We could not verify your email address/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/email address you entered/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/linked to your GOV.UK One Login/i)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go back/i })).toHaveAttribute(
      'href',
      '/lookup-email'
    );
  });

  it('describes the One Login account when reached as an OAuth error callback', async () => {
    await renderPage({ error: 'la_domain_not_allowed' });
    expect(
      screen.getByText(
        /linked to your GOV.UK One Login belongs to a Local Authority/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /sign out of your GOV.UK One Login account/i,
      })
    ).toHaveAttribute('href', 'https://home.account.gov.uk');
    expect(
      screen.queryByText(/email address you entered/i)
    ).not.toBeInTheDocument();
  });

  it('always tells the user how to request access by email', async () => {
    await renderPage({});
    expect(
      screen.getByRole('link', {
        name: /getadultsocialcaredata.team@dhsc.gov.uk/i,
      })
    ).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    expect(
      screen.getAllByRole('listitem').map((li) => li.textContent)
    ).toContain('Local Authority email address');
  });
});
