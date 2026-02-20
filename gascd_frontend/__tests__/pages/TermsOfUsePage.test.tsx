import { render, screen } from '@testing-library/react';
import TermsOfUsePage from '../../app/terms-of-use/page';

describe('TermsOfUsePage', () => {
  it('should render the heading, and some body text', () => {
    render(<TermsOfUsePage />);

    const headingElement = screen.getByRole('heading', {
      name: /Terms of use/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /This page explains the Get Adult Social Care Data/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });
});
