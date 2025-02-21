import { render, screen } from '@testing-library/react';
import Header from '@/components/common/header/Header';

describe('Header Component', () => {
  it('Renders the component correctly', () => {
    render(<Header />);
    const titleText = screen.getByText('Get adult social care data');
    expect(titleText).toBeInTheDocument();
    expect(titleText).toHaveClass(
      'govuk-header__link govuk-header__service-name'
    );
    // const accountManage = screen.getByText('Manage account | Sign out');
    // expect(accountManage).toBeInTheDocument();
    // expect(accountManage.closest('a')).toHaveAttribute('href', '');
  });
});
