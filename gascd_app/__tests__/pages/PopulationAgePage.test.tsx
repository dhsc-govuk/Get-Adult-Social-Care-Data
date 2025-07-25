import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopulationAgePage from '../../app/(protected)/population-age/page';
import { Locations } from '@/data/interfaces/Locations';
import { renderWithSession } from '@/test-utils/test-utils';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import { LAGeoData } from '@/helpers/maps/la_geo_data';
import PresentDemandService from '@/services/present-demand/presentDemandService';

// Mock out things we don't need to prevent them making api requests
jest.mock('@/components/common/buttons/logoutButton');
jest.mock('@/services/logger/logService');

describe('PopulationAge', () => {
  it('should render the heading, body text, and a link', () => {
    renderWithSession(<PopulationAgePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Population age percentages/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Use the map to view population percentages for older age groups at local levels in England/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });

  it('should show a message if la not supported', async () => {
    const unsupportedLACode: Locations = {
      provider_location_id: '',
      provider_location_name: 'Care4all',
      provider_id: '',
      provider_name: '',
      la_code: '12345',
      la_name: 'Caringtown',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: '',
    };
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(Promise.resolve(unsupportedLACode as any));

    renderWithSession(<PopulationAgePage />);

    const bodyTextElement = await screen.findByText(/Care4all/i);
    expect(bodyTextElement.innerHTML).toContain('Care4all, Caringtown');

    const notsupported = await screen.findByText(
      /Map data is not currently available for your care home location./i
    );
    expect(notsupported).toBeInTheDocument();
  });

  it('should show an iframe if LA is supported', async () => {
    const supportedLACode: Locations = {
      provider_location_id: '',
      provider_location_name: 'Care4U',
      provider_id: '',
      provider_name: '',
      la_code: 'E06000001',
      la_name: 'Caresville',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: '',
    };
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(supportedLACode as any);

    renderWithSession(<PopulationAgePage />);

    const bodyTextElement = await screen.findByText(/Care4U/i);
    expect(bodyTextElement.innerHTML).toContain('Care4U, Caresville');

    const iframe = await screen.findByTestId('map-frame');
    expect(iframe).toBeInTheDocument();
    const map_url = iframe.getAttribute('src');
    expect(map_url).toContain('&lad=E06000001');
    // Default age range
    expect(map_url).toContain('/aged-85-years-and-over?');
  });
});

describe('generatePopulationMapURL', () => {
  it('should return nothing if la is not found', () => {
    const url = generatePopulationMapURL(
      '<this-is-not-an-la-code>',
      'agerange'
    );
    expect(url).toBeUndefined();
  });

  it('should render a URL with correct coordinates', () => {
    const test_la = LAGeoData['E06000001'];
    const url = generatePopulationMapURL(test_la.meta.code, 'agerangeX');
    expect(url).toContain('https://www.ons.gov.uk/');
    expect(url).toContain('&lad=E06000001');
    expect(url).toContain('/agerangeX?');
    expect(url).toContain(`&embedBounds=${test_la.bbox[0]},${test_la.bbox[1]}`);

    const url2 = generatePopulationMapURL(test_la.meta.code, 'agerangeY');
    expect(url2).toContain('/agerangeY?');
  });
});
