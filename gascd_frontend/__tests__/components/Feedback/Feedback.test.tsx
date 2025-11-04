import { render, screen } from '@testing-library/react';
import Feedback from '@/components/common/feedback/Feedback';

describe('Feedback', () => {
  const feedback_url = 'http://feedback.form.local/';

  it('Renders the component correctly', () => {
    render(<Feedback />);
    const titleText = screen.getByRole('heading', {
      name: /give your feedback/i,
    });
    expect(titleText).toBeInTheDocument();
    expect(titleText.parentNode).toHaveClass(
      'feedback-container call-to-action'
    );

    const feedbacklink = screen.getByRole('link', {
      name: /Fill in the feedback survey/i,
    });
    expect(feedbacklink).toBeInTheDocument();
    expect(feedbacklink).toHaveAttribute('href', feedback_url);
    expect(feedbacklink).toHaveAttribute('target', '_blank');
  });

  it('Renders the component with no highlight', () => {
    render(<Feedback highlight={false} />);
    const titleText = screen.getByRole('heading', {
      name: /give your feedback/i,
    });
    expect(titleText).toBeInTheDocument();
    expect(titleText.parentNode).toHaveClass('feedback-container');

    const feedbacklink = screen.getByRole('link', {
      name: /Fill in the feedback survey/i,
    });
    expect(feedbacklink).toBeInTheDocument();
    expect(feedbacklink).toHaveAttribute('href', feedback_url);
    expect(feedbacklink).toHaveAttribute('target', '_blank');
  });
});
