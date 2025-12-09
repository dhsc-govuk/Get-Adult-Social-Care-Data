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
      name: 'Disclaimer',
    });
    expect(disclaimer).toHaveAttribute('href', '/disclaimer');
  });

  it('renders version numbers', () => {
    render(<Footer version_hash="abcd1234" version_tag="1.0.0" />);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveAttribute('data-version-tag', '1.0.0');
    expect(footer).toHaveAttribute('data-version-hash', 'abcd1234');
  });

  it('renders privacy link', () => {
    render(<Footer />);
    const disclaimer = screen.getByRole('link', {
      name: 'Privacy',
    });
    expect(disclaimer).toHaveAttribute('href', '/privacy-policy');
  });

  it('renders feedback link', () => {
    render(<Footer />);
    const feedback = screen.getByRole('link', {
      name: 'Feedback',
    });
    expect(feedback).toBeInTheDocument();
    expect(feedback).toHaveAttribute('href', 'http://feedback.form.local/');
    expect(feedback).toHaveClass('govuk-footer__link');
  });

  it('renders help link', () => {
    render(<Footer />);
    const disclaimer = screen.getByRole('link', {
      name: 'Help',
    });
    expect(disclaimer).toHaveAttribute('href', '/help');
  });
});
