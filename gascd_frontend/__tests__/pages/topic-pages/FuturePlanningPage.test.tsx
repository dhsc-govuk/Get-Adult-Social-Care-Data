import { render, screen } from '@testing-library/react';
import FuturePlanningPage from '../../../app/(protected)/topics/(protected-la-metrics)/future-planning/subtopics/page';

describe('FuturePlanningPage', () => {
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
      name: /Population projections within local authorities/i,
    });
    expect(laFundingPlanningLink).toBeInTheDocument();
    expect(laFundingPlanningLink).toHaveAttribute(
      'href',
      '/topics/future-planning/la-funding-planning/data'
    );
  });
});
