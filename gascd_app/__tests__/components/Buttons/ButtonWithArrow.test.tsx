import { render, screen } from '@testing-library/react';
import ButtonWithArrow from '@/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';

describe('ButtonWithArrow Component', () => {
  const buttonText = 'Click here';
  const buttonUrl = '/url';

  it('Renders button with correct button string and href', () => {
    render(<ButtonWithArrow buttonString={buttonText} buttonUrl={buttonUrl} />);

    const linkElement = screen.getByRole('button', { name: buttonText });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', buttonUrl);
  });
});
