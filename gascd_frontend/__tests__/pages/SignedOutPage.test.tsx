import { render, screen } from '@testing-library/react';
import SignedOutPage from '../../app/(authentication)/signed-out/page';
import { FALLBACK_FEEDBACK_URL } from '@/components/common/feedback/Feedback';

describe('SignedOutPage', () => {
  it('should render the heading, some body text, and disclaimer link', () => {
    render(<SignedOutPage />);

    const headingElement = screen.getByRole('heading', {
      name: /You have signed out/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /We're keen to hear about your experience/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /Fill in the feedback survey/i,
    });
    expect(link).toHaveAttribute('href', FALLBACK_FEEDBACK_URL);
  });

  it('should render a re-login link', () => {
    render(<SignedOutPage />);

    const signin_button = screen.getByRole('link', {
      name: /Sign in again/i,
    });
  });
});
