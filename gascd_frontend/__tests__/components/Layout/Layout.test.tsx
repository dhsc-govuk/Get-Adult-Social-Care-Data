import { render, screen } from '@testing-library/react';
import Layout from '@/components/common/layout/Layout';

describe('Layout', () => {
  it('Renders the main layout correctly', () => {
    render(<Layout title="My test page" />);
    expect(document.title).toBe(
      'My test page - Get adult social care data - GOV.UK'
    );

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

  it('Renders version numbers in footer', () => {
    render(<Layout title="My test page" />);
    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    // These should match those in vi.setup.ts
    expect(footer.getAttribute('data-version-tag')).toBe('0.1.0');
    expect(footer.getAttribute('data-version-hash')).toBe('testab1234');
  });
});
