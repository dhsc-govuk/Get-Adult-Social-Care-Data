import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Locations } from '@/data/interfaces/Locations';
import { renderWithSession } from '@/test-utils/test-utils';
import PresentDemandPage from '../../app/(protected)/present-demand/page';
import PresentDemandService from '@/services/present-demand/presentDemandService';

// Mock out things we are not testing at the moment to prevent them making api requests
jest.mock('@/components/common/buttons/logoutButton');
jest.mock('@/services/logger/logService');
//jest.mock('@/services/present-demand/presentDemandService')
jest.mock('@/services/indicator/IndicatorFetchService');

// This is NOT currently a good test of most of the page functionality,
// but we have to start somewhere eh?
describe('PresentDemandPage', () => {
  it('should render the heading, body text, and a link', () => {
    renderWithSession(<PresentDemandPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Current population needs and capacity/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Understanding current population needs and capacity for adult social care services helps identify where needs are being met and where gaps may exist./i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });

  it('should render an MSP statement', async () => {
    const supportedLACode: Locations = {
      provider_location_id: '',
      provider_location_name: 'Who Cares?',
      provider_id: '',
      provider_name: '',
      la_code: 'testla1',
      la_name: 'Whosville',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: '',
    };
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(supportedLACode as any);

    renderWithSession(<PresentDemandPage />);

    const mspHeading = screen.getByRole('heading', {
      name: /Find more information on your local care market/i,
    });
    expect(mspHeading).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Every local authority in England must produce a Market Position Statement/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const mspLink = await screen.findByTestId('msp-link');
    expect(mspLink).toBeInTheDocument();
    expect(mspLink.innerHTML).toContain(
      'Market Position Statement for Whosville'
    );
    expect(mspLink.getAttribute('href')).toBe(
      'https://www.gov.uk/government/organisations/department-of-health-and-social-care'
    );
  });

  it('should not render an MSP statement if LA has none', async () => {
    const unsupportedLACode: Locations = {
      provider_location_id: '',
      provider_location_name: 'Who Cares?',
      provider_id: '',
      provider_name: '',
      la_code: '<not-an-la-code>',
      la_name: 'Whosville',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: '',
    };
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(unsupportedLACode as any);

    renderWithSession(<PresentDemandPage />);

    // heading and explainer text should still exist
    const mspHeading = screen.getByRole('heading', {
      name: /Find more information on your local care market/i,
    });
    expect(mspHeading).toBeInTheDocument();
    const bodyTextElement = screen.getByText(
      /Every local authority in England must produce a Market Position Statement/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    // Link should not appear
    // XXX This could be improved by checking that some other dynamic
    // element *does* exist
    const mspLink = screen.queryByTestId('msp-link');
    expect(mspLink).toBeNull();
  });
});
