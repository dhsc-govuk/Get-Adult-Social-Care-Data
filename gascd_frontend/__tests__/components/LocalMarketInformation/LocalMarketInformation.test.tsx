import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';

const registerUrl = 'https://www.example.gov.uk/mps';
const linkName = 'Market Position Statement for My Test LA (opens in new tab)';
const fallbackText =
  /We were unable to find a market position statement for the selected/;

describe('Service Component', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ E09000003: { url: registerUrl } }),
    } as Response);
  });

  it('Renders the component correctly', () => {
    render(
      <LocalMarketInformation localAuthority="Test" localAuthorityId="1234" />
    );
    const titleText = screen.getByText('Information on the local care market');
    expect(titleText).toBeInTheDocument();
  });

  it('Renders fallback text and no URL if LA id not found', async () => {
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="notanlacode"
      />
    );
    const fallback = await screen.findByText(fallbackText);
    expect(fallback.textContent).toBe(
      'We were unable to find a market position statement for the selected LA. Get in touch with the LA to request it.'
    );
    expect(
      screen.queryByRole('link', { name: linkName })
    ).not.toBeInTheDocument();
  });

  it('Renders the URL from the register', async () => {
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="E09000003"
      />
    );
    const link = await screen.findByRole('link', { name: linkName });
    expect(link.getAttribute('href')).toBe(registerUrl);
    expect(global.fetch).toHaveBeenCalledWith('/api/get_mps_links');
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument();
  });

  it('Shows neither a URL nor the fallback text while loading', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="testla1"
      />
    );
    expect(
      screen.queryByRole('link', { name: linkName })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument();
  });

  it('Renders fallback text and no URL if the register cannot be loaded', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="testla1"
      />
    );
    expect(await screen.findByText(fallbackText)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: linkName })
    ).not.toBeInTheDocument();
  });
});
