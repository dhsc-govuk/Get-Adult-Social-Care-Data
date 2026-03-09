import { render, screen } from '@testing-library/react';
import FuturePlanningPage from '../../../app/(protected)/topics/future-planning/subtopics/page';

describe('PopulationNeedsPage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<FuturePlanningPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Future planning/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Find estimated and experimental data on future population needs./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const laFundingPlanningLink = screen.getByRole('link', {
      name: /Local Authority funding planning/i,
    });
    expect(laFundingPlanningLink).toBeInTheDocument();
    expect(laFundingPlanningLink).toHaveAttribute(
      'href',
      '/topics/future-planning/la-funding-planning/data'
    );
  });
});
