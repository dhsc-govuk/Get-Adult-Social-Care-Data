import { render, screen } from '@testing-library/react';
import HomePage from '../../app/(protected)/home/page';

describe('HomePage', () => {
  it('should render the heading, body text, and a link', () => {
    render(<HomePage />);

    // 1. Check for the main heading
    // We use getByRole to find the heading element. The 'name' option is an
    // accessible way to find headings by their text content (case-insensitive).
    const headingElement = screen.getByRole('heading', {
      name: /Get adult social care data/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    // 2. Check for some body text
    // getByText is a straightforward way to find non-interactive text content.
    const bodyTextElement = screen.getByText(
      /This service shows local and regional statistics based on your selected location./i
    );
    expect(bodyTextElement).toBeInTheDocument();

    // 3. Check for the presence of a link
    // We find the link by its role and accessible name (the text it displays).
    // This is generally more robust than checking the href directly at first.
    const linkElement = screen.getByRole('link', {
      name: /Care home beds and occupancy levels/i,
    });
    expect(linkElement).toBeInTheDocument();

    const linkElement2 = screen.getByRole('link', {
      name: /Population needs/i,
    });
    expect(linkElement2).toBeInTheDocument();
    expect(linkElement2).toHaveAttribute(
      'href',
      'topics/population-needs/subtopics'
    );
  });
});
