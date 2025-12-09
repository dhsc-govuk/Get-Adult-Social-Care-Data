import { render, screen } from '@testing-library/react';
import PopulationNeedsPage from '../../../app/(protected)/topics/population-needs/subtopics/page';

describe('PopulationNeedsPage', () => {
  it('should render the heading, body text, and a link', () => {
    render(<PopulationNeedsPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Population needs/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Find data on a range of care need indicators, such as household economic factors and disability prevalence./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const dementiaLinkElement = screen.getByRole('link', {
      name: /Dementia prevalence and estimated diagnosis rate/i,
    });
    expect(dementiaLinkElement).toBeInTheDocument();
    expect(dementiaLinkElement).toHaveAttribute(
      'href',
      '/topics/population-needs/dementia-prevalence/data'
    );

    const economicLinkElement = screen.getByRole('link', {
      name: /Economic factors and household composition/i,
    });
    expect(economicLinkElement).toBeInTheDocument();
    expect(economicLinkElement).toHaveAttribute(
      'href',
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    const healthLinkElement = screen.getByRole('link', {
      name: /General health, disability and learning disability/i,
    });
    expect(healthLinkElement).toBeInTheDocument();
    expect(healthLinkElement).toHaveAttribute(
      'href',
      '/topics/population-needs/disability-prevalence/data'
    );

    const populationLinkElement = screen.getByRole('link', {
      name: /Population size and age group percentages/i,
    });
    expect(populationLinkElement).toBeInTheDocument();
    expect(populationLinkElement).toHaveAttribute(
      'href',
      '/topics/population-needs/population-age-and-size/data'
    );
  });
});
