import { render, screen } from '@testing-library/react';
import LoginPage from '../../app/(authentication)/login/page';

describe('LoginPage', () => {
  it('should render the heading, some body text', () => {
    render(<LoginPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Get adult social care data service/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const subheadingElement = screen.getByRole('heading', {
      name: /Who can use this service/i,
    });
    expect(subheadingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /You can only use this service if you are the nominated individual/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });

  it('should render a start link to the user-type question', () => {
    render(<LoginPage />);

    const startLink = screen.getByRole('link', { name: /Start now/i });
    expect(startLink).toHaveAttribute('href', '/whoami');
  });
});
