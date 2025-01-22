import { render, screen } from '@testing-library/react';
import Navbar from '@/components/common/navbar/Navbar';

describe('Navbar component test', () => {
  test('Renders the component correctly', () => {
    render(<Navbar currentPage="home"></Navbar>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('Displays Home link with active class when currentPage is "Home"', () => {
    render(<Navbar currentPage="Home"></Navbar>);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveClass('govuk-service-navigation__link');
    const listItem = homeLink.closest('li');
    expect(listItem).toHaveClass('govuk-service-navigation__item--active');
  });

  test('Home link does not have active class when currentPage is not "Home"', () => {
    render(<Navbar currentPage="About" />);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    const listItem = homeLink.closest('li');
    expect(listItem).not.toHaveClass('govuk-service-navigation__item--active');
  });
});
