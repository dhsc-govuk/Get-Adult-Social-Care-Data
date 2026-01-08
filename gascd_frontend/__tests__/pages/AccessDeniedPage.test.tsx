import { render, screen } from '@testing-library/react';
import AccessDeniedPage from '../../app/(onboarding)/access-denied/page';

describe('AccessDeniedPage', () => {
  it('should render the heading, and some body text', () => {
    render(<AccessDeniedPage />);

    const headingElement = screen.getByRole('heading', {
      name: /You do not have access to this service/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(/If you think you need access/i);
    expect(bodyTextElement).toBeInTheDocument();
  });
});
