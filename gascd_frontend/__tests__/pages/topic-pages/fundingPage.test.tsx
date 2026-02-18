import { render, screen } from '@testing-library/react';
import FundingPage from '../../../app/(protected)/topics/financial-spend-and-unpaid-care/subtopics/page';

describe('FundingPage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<FundingPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Funding/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Find data on local authority funding./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const laFundingLinkElement = screen.getByRole('link', {
      name: /Local Authority funding/i,
    });
    expect(laFundingLinkElement).toBeInTheDocument();
    expect(laFundingLinkElement).toHaveAttribute(
      'href',
      '/topics/financial-spend-and-unpaid-care/financial-spend/data'
    );
  });
});
