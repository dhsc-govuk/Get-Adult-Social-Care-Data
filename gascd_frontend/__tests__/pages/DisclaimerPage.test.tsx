import { render, screen } from '@testing-library/react';
import DisclaimerPage from '../../app/terms-of-use/page';

describe('DisclaimerPage', () => {
  it('should render the heading, and some body text', () => {
    render(<DisclaimerPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Disclaimer/i,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /Get adult social care data is in a beta testing phase/i
    );
    expect(bodyTextElement).toBeInTheDocument();
  });
});
