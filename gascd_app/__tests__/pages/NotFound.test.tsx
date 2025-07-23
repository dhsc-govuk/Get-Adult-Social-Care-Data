import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '../../app/not-found';

describe('NotFound Page', () => {
  it('renders the layout header', () => {
    render(<NotFound />);
    expect(document.querySelector('.govuk-header')).toBeInTheDocument();
  });

  it('should have the link to the homepage', () => {
    render(<NotFound />);

    const linkElement = screen.getByRole('link', {
      name: /Get adult social care data/i,
    });
    expect(linkElement).toBeInTheDocument();
    
    expect(linkElement).toHaveAttribute('href', '/');
  });

  it('renders the layout footer', () => {
    render(<NotFound />);
    expect(document.querySelector('.govuk-footer')).toBeInTheDocument();
  });

  it('renders The not found page content', () => {
    render(<NotFound />);
    
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    
    expect(screen.getByText(/If you typed the web address, check it is correct./)).toBeInTheDocument();
    
    expect(screen.getByText(/If you pasted the web address, check you copied the entire address./)).toBeInTheDocument();
  });
});