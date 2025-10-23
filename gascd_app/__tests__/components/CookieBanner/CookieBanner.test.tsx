import React from 'react';
import { render, screen } from '@testing-library/react';
import CookieBanner from '@/components/common/cookie-banner/CookieBanner';
import * as mockData from '../../../TestData/ConditionalTextMockData';
import { mock } from 'node:test';

describe('Tests for the cookie banner component', () => {
  it('Renders the cookie banner when no consent cookie is set', () => {
    // Ensure the consent cookie is not set
    document.cookie =
      'GASCDConsentGDPR=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    render(<CookieBanner />);

    const bannerElement = screen.getByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).toBeInTheDocument();
  });

  it('Does not render the cookie banner when consent cookie is set', () => {
    // Set the consent cookie
    document.cookie = 'GASCDConsentGDPR=true; path=/';

    render(<CookieBanner />);

    const bannerElement = screen.queryByRole('region', {
      name: /Cookies on Get adult social care data/i,
    });
    expect(bannerElement).not.toBeInTheDocument();
  });
});
