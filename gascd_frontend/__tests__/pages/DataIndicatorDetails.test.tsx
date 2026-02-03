import { render, screen } from '@testing-library/react';
import DataIndicatorDetailsPage from '../../app/(protected)/service-information/data-indicator-details/page';

describe('DataIndicatorDetails', () => {
  it('should render the heading, and some body text', () => {
    render(<DataIndicatorDetailsPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Data indicator details/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(/Care provider data indicators/i);
    expect(bodyTextElement).toBeInTheDocument();

    const firstLink = screen.getByRole('link', {
      name: /Adult social care beds per 100,000 adult population - over time/i,
    });

    expect(firstLink).toBeInTheDocument();
    expect(firstLink).toHaveAttribute(
      'href',
      '/help/beds-per-100000-adult-population-over-time'
    );
  });
});
