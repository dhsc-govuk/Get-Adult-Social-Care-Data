import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopulationAgePage from '../../app/(protected)/population-age/page';
import { renderWithSession } from '@/test-utils/test-utils';

describe('PopulationAge', () => {
  it('should render the heading, body text, and a link', () => {
    renderWithSession(<PopulationAgePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Population age/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Explore population data by age group across local authorities and districts in England/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });
});
