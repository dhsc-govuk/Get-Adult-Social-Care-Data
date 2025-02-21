import { render, screen, fireEvent } from '@testing-library/react';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton.tsx';

describe('StandardButton Component', () => {
  it('renders with the correct button string', () => {
    render(
      <StandardButton
        buttonString="Click here"
        buttonFunction={() => {}}
      ></StandardButton>
    );
    expect(
      screen.getByRole('button', { name: 'Click here' })
    ).toBeInTheDocument();
  });

  it('calls the function when clicked', () => {
    const mockFunction = jest.fn();
    render(
      <StandardButton
        buttonString="Click here"
        buttonFunction={mockFunction}
      ></StandardButton>
    );
    const button = screen.getByRole('button', { name: 'Click here' });
    fireEvent.click(button);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
