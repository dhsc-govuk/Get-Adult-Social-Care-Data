import { render, screen } from '@testing-library/react';
import CareHomePage from '../../../app/(protected)/topics/residential-care/subtopics/page';

describe('CareHomePage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<CareHomePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Care homes/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Find data on residential care homes and nursing homes across England./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const careHomeBedsLinkElement = screen.getByRole('link', {
      name: /Care home beds and occupancy levels/i,
    });
    expect(careHomeBedsLinkElement).toBeInTheDocument();
    expect(careHomeBedsLinkElement).toHaveAttribute(
      'href',
      '/topics/residential-care/provision-and-occupancy/data'
    );
  });
});
