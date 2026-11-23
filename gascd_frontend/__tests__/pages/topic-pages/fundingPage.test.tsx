import { render, screen } from '@testing-library/react';
import FundingPage from '../../../app/(protected)/topics/financial-spend-and-unpaid-care/subtopics/page';
import { TOPICS } from '@/config/topics';

describe('FundingPage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<FundingPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Funding/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(/funding for adult social care/i);
    expect(bodyTextElement).toBeInTheDocument();

    // Every page listed under Funding, including market position statements
    TOPICS.funding.subtopics.forEach((subtopic) => {
      expect(
        screen.getByRole('link', { name: subtopic.title })
      ).toHaveAttribute('href', subtopic.url);
    });
  });
});
