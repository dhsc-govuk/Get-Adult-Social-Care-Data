import { render, screen } from '@testing-library/react';
import Header from '@/components/common/header/Header';

describe('Header Component', () => {
  it('Renders the component correctly', () => {
    render(<Header />);
    const titleText = screen.getByText('GOV.UK');
    expect(titleText).toBeInTheDocument();
    expect(titleText.parentNode).toHaveClass(
      'govuk-header__logotype__broken'
    );
  });
});
