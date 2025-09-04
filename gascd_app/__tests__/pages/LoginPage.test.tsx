import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../app/(authentication)/login/page';

describe('LoginPage', () => {
  it('should render the heading, some body text, and disclaimer link', () => {
    render(<LoginPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Get adult social care data/i,
    });
    expect(headingElement).toBeInTheDocument();

    const subheadingElement = screen.getByRole('heading', {
      name: /Introduction/i,
    });
    expect(subheadingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /This new digital service is owned by DHSC/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const links = screen.getAllByRole('link', {
      name: /Full Disclaimer \(opens in new tab\)/i,
    });
    expect(links.length).toBe(2);
    for (let link of links) {
      expect(link).toHaveAttribute('href', '/disclaimer');
    }
  });

  it('should render a login link', () => {
    render(<LoginPage />);

    const signin_button = screen.getByRole('button', {
      name: /Agree and sign in/i,
    });
  });
});
