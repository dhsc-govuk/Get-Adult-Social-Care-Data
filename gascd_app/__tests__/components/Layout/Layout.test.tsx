import { render, screen } from '@testing-library/react';
import Layout from '@/components/common/layout/Layout';

describe('Layout', () => {
  it('Renders the main layout correctly', () => {
    render(<Layout title="My test page" />);
    expect(document.title).toBe(
      'My test page - Get adult social care data - GOV.UK'
    );

    const skiplink = screen.getByRole('link', {
      name: 'Skip to main content',
    });
    expect(skiplink).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Support links');
    expect(footer).toHaveTextContent('Crown copyright');
  });

  it('Renders a back link', () => {
    render(<Layout title="My test page" backURL="/myback" />);
    const backlink = screen.getByRole('link', {
      name: 'Back',
    });
    expect(backlink).toBeInTheDocument();
    expect(backlink.getAttribute('href')).toBe('/myback');
  });
});
