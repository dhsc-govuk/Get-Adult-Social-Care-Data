import { render, screen } from '@testing-library/react';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';

describe('Service Component', () => {
  it('Renders the component correctly', () => {
    render(
      <LocalMarketInformation localAuthority="Test" localAuthorityId="1234" />
    );
    const titleText = screen.getByText('Information on the local care market');
    expect(titleText).toBeInTheDocument();
  });

  it('Renders no URL if LA id not found', () => {
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="notanlacode"
      />
    );
    const link = screen.queryByRole('link', {
      name: 'Market Position Statement for My Test LA (opens in new tab)',
    });
    expect(link).not.toBeInTheDocument();
  });

  it('Renders a URL if LA is valid', () => {
    render(
      <LocalMarketInformation
        localAuthority="My Test LA"
        localAuthorityId="testla1"
      />
    );
    const link = screen.getByRole('link', {
      name: 'Market Position Statement for My Test LA (opens in new tab)',
    });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe(
      'https://www.gov.uk/government/organisations/department-of-health-and-social-care'
    );
  });
});
