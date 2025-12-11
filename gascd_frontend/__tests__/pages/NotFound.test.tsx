import { render, screen } from '@testing-library/react';
import NotFound from '../../app/not-found';

describe('NotFound Page', () => {
  it('renders the layout footer', () => {
    render(<NotFound />);
    expect(document.querySelector('.govuk-footer')).toBeInTheDocument();
  });

  it('renders The not found page content', () => {
    render(<NotFound />);

    expect(screen.getByText('Page not found')).toBeInTheDocument();

    expect(
      screen.getByText(/If you typed the web address, check it is correct./)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /If you pasted the web address, check you copied the entire address./
      )
    ).toBeInTheDocument();
  });
});
