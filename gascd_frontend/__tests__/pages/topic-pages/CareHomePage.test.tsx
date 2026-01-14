import { render, screen } from '@testing-library/react';
import CareHomePage from '../../../app/(protected)/topics/residential-care/subtopics/page';

describe('CareHomePage', () => {
  it('should render the heading, body text, and topic links', () => {
    render(<CareHomePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Care provision/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Find data on care provision and the support provided by unpaid carers across England./i
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

    const unpaidCareLinkElement = screen.getByRole('link', {
      name: /Unpaid care/i,
    });
    expect(unpaidCareLinkElement).toBeInTheDocument();
    expect(unpaidCareLinkElement).toHaveAttribute(
      'href',
      '/topics/residential-care/unpaid-care/data'
    );
  });
});
