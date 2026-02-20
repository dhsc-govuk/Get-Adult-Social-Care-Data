import { render, screen } from '@testing-library/react';
import TermsPage from '../../app/(onboarding)/accept-terms/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('TermsPage', () => {
  it('should render the heading, and some body text', () => {
    render(<TermsPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Terms of use/i,
    });
    expect(headingElement).toBeInTheDocument();

    const linkElement = screen.getByRole('link', {
      name: 'Terms of use (opens in new window)',
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toBe('/terms-of-use');

    const button = screen.getByRole('button', {
      name: /agree/i,
    });
    expect(button).toBeInTheDocument();
  });
});
