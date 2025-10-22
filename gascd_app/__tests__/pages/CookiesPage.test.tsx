import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookiesPage from '../../app/cookies/page';

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
  });

  it('should not render the cookie banner', () => {
    render(<CookiesPage />);

    const bannerElement = screen.queryByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).not.toBeInTheDocument();
  });
});
