import { render, screen } from '@testing-library/react';
import HelpPage from '../../app/help/page';

describe('HelpPage', () => {
  it('should render the heading, and some body text', () => {
    render(<HelpPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Get help with this service/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /If you have any questions or need support with this service/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /getadultsocialcaredata.team@dhsc.gov.uk/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'mailto:getadultsocialcaredata.team@dhsc.gov.uk'
    );
  });
});
