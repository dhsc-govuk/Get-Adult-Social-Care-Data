import { render, screen } from '@testing-library/react';
import QualityOfCarePage from '../../../app/(protected)/topics/quality-of-care/subtopics/page';

describe('QualityOfCarePage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<QualityOfCarePage />);

    expect(
      screen.getByRole('heading', { name: /Quality of care/i, level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Find data on the quality of adult social care/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /CQC ratings of adult social care locations/i,
      })
    ).toHaveAttribute('href', '/topics/quality-of-care/cqc-ratings/data');
    expect(
      screen.getByText(
        /Data on CQC ratings of adult social care locations, including number and percentage of locations by CQC rating, number and percentage not yet inspected, and date of latest inspection./i
      )
    ).toBeInTheDocument();
  });
});
