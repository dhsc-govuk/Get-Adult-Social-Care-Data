import { render, screen } from '@testing-library/react';
import ConsentPage from '../../app/(onboarding)/consent/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ConsentPage', () => {
  it('should render the heading, and some body text', () => {
    render(<ConsentPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Do you want to receive email/i,
    });
    expect(headingElement).toBeInTheDocument();

    const linkElement = screen.getByRole('link', {
      name: /Read our privacy policy/i,
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toBe('/privacy-policy');
  });
});
