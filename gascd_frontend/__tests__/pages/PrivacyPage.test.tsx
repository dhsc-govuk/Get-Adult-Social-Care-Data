import { render, screen } from '@testing-library/react';
import PrivacyPage from '../../app/privacy-policy/page';

describe('PrivacyPage', () => {
  it('should render the heading, and some body text', () => {
    render(<PrivacyPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Our privacy notice/i,
    });
    expect(headingElement).toBeInTheDocument();

    const subheadingElement = screen.getByRole('heading', {
      name: /Who we are/i,
    });
    expect(subheadingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /We collect your personal data to:/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /www.ico.org.uk/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://ico.org.uk');
  });
});
