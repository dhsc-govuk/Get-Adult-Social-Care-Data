import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopulationAgePage from '../../app/(protected)/population-age/page';
import { renderWithSession } from '@/test-utils/test-utils';

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
