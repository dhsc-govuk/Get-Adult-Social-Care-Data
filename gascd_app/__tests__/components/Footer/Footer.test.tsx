import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/common/footer/Footer';

describe('Footer', () => {
  it('renders correct copyright logo URL', () => {
    render(<Footer />);
    const copyright = screen.getByRole('link', {
      name: /Crown copyright/i,
    });
    expect(copyright).toBeInTheDocument();
    expect(copyright).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    );
  });

  it('renders disclaimer link', () => {
    render(<Footer />);
    const disclaimer = screen.getByRole('link', {
      name: /Disclaimer/i,
    });
    expect(disclaimer).toHaveAttribute('href', '/disclaimer');
  });

  it('renders feedback link', () => {
    render(<Footer />);
    const feedback = screen.getByRole('link', {
      name: /feedback/i,
    });
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute('href', 'http://feedback.form.local/');
    expect(feedback).toHaveClass('govuk-footer__link');
  });
});
