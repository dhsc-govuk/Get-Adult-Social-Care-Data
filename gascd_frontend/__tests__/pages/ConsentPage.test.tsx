import { render, screen } from '@testing-library/react';
import ConsentPage from '../../app/(onboarding)/consent/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ConsentPage', () => {
  it('should render the heading, and some body text', () => {
    render(<ConsentPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Can we send you email/i,
    });
    expect(headingElement).toBeInTheDocument();

    const linkElement = screen.getByRole('link', {
      name: /privacy policy/i,
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toBe('/privacy-policy');

    const optionradio = screen.getByRole('radio', {
      name: /yes/i,
    });
    expect(optionradio).toBeInTheDocument();
    const optionradio_no = screen.getByRole('radio', {
      name: /no/i,
    });
    expect(optionradio_no).toBeInTheDocument();
  });
});
