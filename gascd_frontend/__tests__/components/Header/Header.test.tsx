import { render, screen } from '@testing-library/react';
import Header from '@/components/common/header/Header';
import { mockSession } from '@/test-utils/test-utils';

describe('Header Component', () => {
  it('Renders the component correctly', () => {
    render(<Header />);
    const titleText = screen.getByText('GOV.UK');
    expect(titleText).toBeInTheDocument();
    expect(titleText.parentNode).toHaveClass(
      'rebranded-one-login-header__logotype'
    );

    const skiplink = screen.getByRole('link', {
      name: 'Skip to main content',
    });
    expect(skiplink).toBeInTheDocument();

    const signout = screen.queryByRole('link', {
      name: 'Sign out',
    });
    expect(signout).not.toBeInTheDocument();
  });

  it('Renders sign out if logged in', () => {
    render(<Header session={mockSession} />);
    const signout = screen.getByRole('link', {
      name: 'Sign out',
    });
    expect(signout).toBeInTheDocument();
  });
});
