import { render, screen } from '@testing-library/react';
import LocationSelectPage from '../../app/(authentication)/location-select/page';

describe('LocationSelectPage', () => {
  it('should render the heading and some body text', () => {
    render(<LocationSelectPage />);

    const headingElement = screen.getByRole('heading', {
      name: /Select a location from your care provider group/i,
      level: 1,
    });
    expect(headingElement).toBeInTheDocument();

    const bodyTextElement = screen.getByText(
      /We use the selected location to show you:/i
    );
    expect(bodyTextElement).toBeInTheDocument();

    const locationSelectInput = screen.getByRole('combobox');
    expect(locationSelectInput).toBeInTheDocument();
  });

});