import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../app/(authentication)/login/page';
import { text } from 'd3';

describe('LoginPage', () => {
  it('should render the heading, and a login button', () => {
    render(<LoginPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Get adult social care data/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /This service does not constitute advice/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const disclaimers = screen.getAllByRole('link', {
      name: /Full Disclaimer/i,
    });
    expect(disclaimers.length).toBe(2);
    disclaimers.forEach((disclaimer) => {
      expect(disclaimer).toBeInTheDocument();
      expect(disclaimer).toHaveAttribute('href', '/disclaimer');
    });

    const loginButton = screen.getByRole('button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Agree and sign in');
  });
});
