import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Locations } from '@/data/interfaces/Locations';
import { renderWithSession } from '@/test-utils/test-utils';
import PresentDemandPage from '../../app/(protected)/present-demand/page';
import PresentDemandService from '@/services/present-demand/presentDemandService';

// Mock out things we are not testing at the moment to prevent them making api requests
jest.mock('@/components/common/buttons/logoutButton');
jest.mock('@/services/logger/logService');
jest.mock('@/services/indicator/IndicatorFetchService');

beforeEach(() => {
  // Stop localstorage usage interfering with other tests
  window.localStorage.clear();
});

// An example care provider location
const exampleLaCode: Locations = {
  provider_location_id: '',
  provider_location_name: 'Care4all',
  provider_id: '',
  provider_name: '',
  la_code: 'testla1',
  la_name: 'Caringtown',
  region_code: '',
  region_name: 'Careston',
  country_code: '',
  country_name: 'UK',
  load_date_time: '',
};

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

    // Check that all main headings exist in the side menu
    const sidenav = screen.getByLabelText('Side navigation');
    expect(sidenav).toBeInTheDocument();
    const sidenav_links = sidenav.getElementsByTagName('a');
    const sidenav_urls = [];
    for (let link of sidenav_links) {
      sidenav_urls.push(link.innerHTML);
    }
    const expected_headings = [
      'Your selected locations',
      'Drivers of population needs',
      'Current capacity - care homes: local authority-level insights',
      'Current capacity - care homes: care provider-level insights',
      'Indicator definitions and supporting information',
      'Find more information on your local care market',
    ];
    for (let heading_text of expected_headings) {
      expect(
        screen.getByRole('heading', { name: heading_text })
      ).toBeInTheDocument();
      expect(sidenav_urls).toContain(heading_text);
    }
  });

  it('should render the user care location', async () => {
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(Promise.resolve(exampleLaCode as any));

    renderWithSession(<PresentDemandPage />);

    const location_label = await screen.findByTestId('location-names');
    expect(location_label).toBeInTheDocument();
    expect(location_label.innerHTML).toBe('Care4all, Caringtown, Careston, UK');
  });

  it('should render the user care location for stored locations', async () => {
    const allowed_locations = [{ metric_location_id: 'testlocation_another' }];
    window.localStorage.setItem('selectedValue', 'testlocation_another');
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(Promise.resolve(exampleLaCode as any));
    jest
      .spyOn(PresentDemandService, 'getAvailableLocations')
      .mockResolvedValue(Promise.resolve(allowed_locations as any));

    renderWithSession(<PresentDemandPage />);

    const location_label = await screen.findByTestId('location-names');
    expect(location_label).toBeInTheDocument();
    expect(location_label.innerHTML).toBe('Care4all, Caringtown, Careston, UK');
  });

  it('should *not* the user care location if saved location is invalid', async () => {
    const allowed_locations = [{ metric_location_id: 'testlocation1' }];
    // Manually set the stored location to something invalid
    window.localStorage.setItem('selectedValue', 'invalid');
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(Promise.resolve(exampleLaCode as any));
    jest
      .spyOn(PresentDemandService, 'getAvailableLocations')
      .mockResolvedValue(Promise.resolve(allowed_locations as any));

    renderWithSession(<PresentDemandPage />);

    // Element should not appear
    await expect(screen.findByTestId('location-names')).rejects.toThrow(
      'Unable to find an element'
    );
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
      /Most local authorities in England publish Market Position Statements/i
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
      /Most local authorities in England publish Market Position Statements/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    // Link should not appear
    // XXX This could be improved by checking that some other dynamic
    // element *does* exist
    const mspLink = screen.queryByTestId('msp-link');
    expect(mspLink).toBeNull();
  });
});
