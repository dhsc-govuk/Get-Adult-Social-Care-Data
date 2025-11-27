import { render, screen } from '@testing-library/react';
import CookiesPage from '../../app/cookies/page';

const EXPECTED_COOKIES = [
  'GASCDConsentGDPR',
  'better-auth.state',
  'better-auth.session-data',
  'better-auth.session-token',
];

describe('CookiesPage', () => {
  it('should render the heading, and some body text', () => {
    render(<CookiesPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Cookies on Get adult social care data/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const subheadingElement = screen.getByRole('heading', {
      name: /Essential cookies/i,
      level: 2,
    });
    expect(subheadingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Optional cookies help us to improve the service/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const radio = screen.getByRole('radio', {
      name: /Yes/i,
    });
    expect(radio).toBeInTheDocument();

    for (let cookiename of EXPECTED_COOKIES) {
      // Check there is a table cell matching each expected cookie
      const cookierow = screen.getByText(cookiename);
      expect(cookierow).toBeInTheDocument();
      expect(cookierow.tagName).toBe('TD');
    }
  });

  it('should not render the cookie banner', () => {
    render(<CookiesPage />);

    const bannerElement = screen.queryByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).not.toBeInTheDocument();
  });
});
