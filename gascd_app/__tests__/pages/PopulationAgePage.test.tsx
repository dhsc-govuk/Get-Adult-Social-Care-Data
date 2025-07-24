import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopulationAgePage from '../../app/(protected)/population-age/page';
import { renderWithSession } from '@/test-utils/test-utils';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import { LAGeoData } from '@/helpers/maps/la_geo_data';

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
