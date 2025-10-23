import React from 'react';
import { render, screen } from '@testing-library/react';
import CookieBanner from '@/components/common/cookie-banner/CookieBanner';

describe('Tests for the cookie banner component', () => {
  it('Renders the cookie banner when no consent cookie is set', () => {
    document.cookie = 'GASCDConsentGDPR=; expires=; path=/';

    render(<CookieBanner />);

    const bannerElement = screen.getByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).toBeInTheDocument();
  });

  it('Does not render the cookie banner when consent cookie is set', () => {
    document.cookie = 'GASCDConsentGDPR=true; path=/';

    render(<CookieBanner />);

    const bannerElement = screen.queryByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).not.toBeInTheDocument();
  });
});
