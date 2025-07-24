import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopulationAgePage from '../../app/(protected)/population-age/page';
import { Locations } from '@/data/interfaces/Locations';
import { renderWithSession } from '@/test-utils/test-utils';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import { LAGeoData } from '@/helpers/maps/la_geo_data';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import LogService from '@/services/logger/logService';

describe('PopulationAge', () => {
  it('should render the heading, body text, and a link', () => {
    jest.spyOn(LogService, 'logEvent').mockResolvedValue(undefined);

    act(() => {
      renderWithSession(<PopulationAgePage />);
    });

    const headingElement = screen.getByRole('heading', {
      name: /Population age percentages/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Use the map to view population percentages for older age groups at local levels in England/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });

  it('should render the location name ', async () => {
    const mockLocations: Locations = {
      provider_location_id: '',
      provider_location_name: 'The Shire',
      provider_id: '',
      provider_name: '',
      la_code: '',
      la_name: 'Middle Earth',
      region_code: '',
      region_name: '',
      country_code: '',
      country_name: '',
      load_date_time: '',
    };
    jest
      .spyOn(PresentDemandService, 'getLocations')
      .mockResolvedValue(Promise.resolve(mockLocations as any));
    jest.spyOn(LogService, 'logEvent').mockResolvedValue(undefined);

    act(() => {
      renderWithSession(<PopulationAgePage />);
    });

    const bodyTextElement = await screen.findByText(/The Shire/i);
    expect(bodyTextElement.innerHTML).toContain('The Shire, Middle Earth');
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
    expect(url).toContain('/agerangeX');
    expect(url).toContain(`&embedBounds=${test_la.bbox[0]},${test_la.bbox[1]}`);
  });
});
