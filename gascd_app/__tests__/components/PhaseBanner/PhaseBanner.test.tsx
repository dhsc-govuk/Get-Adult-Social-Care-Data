import { render, screen } from '@testing-library/react';
import PhaseBanner from '@/components/common/phase-banner/PhaseBanner';

describe('Phase Banner', () => {
  it('Renders the component correctly', () => {
    render(<PhaseBanner />);
    const titleText = screen.getByText('Beta');
    expect(titleText).toBeInTheDocument();
    expect(titleText).toHaveClass('govuk-tag govuk-phase-banner__content__tag');
  });

  it('Renders a feedback form link', () => {
    render(<PhaseBanner />);
    const feedback = screen.getByRole('link', {
      name: /feedback/i,
    });
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute('href', 'http://feedback.form.local/');
  });
});
