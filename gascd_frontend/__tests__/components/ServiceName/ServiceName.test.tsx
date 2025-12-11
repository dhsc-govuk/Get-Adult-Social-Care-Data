import { render, screen } from '@testing-library/react';
import ServiceName from '@/components/common/service-name/ServiceName';
import { mockSession, mockSessionWithLocation } from '@/test-utils/test-utils';

describe('Service Component', () => {
  it('Renders the component correctly', () => {
    render(<ServiceName />);
    const titleText = screen.getByText('Get adult social care data');
    expect(titleText).toBeInTheDocument();
    expect(titleText).toHaveClass('govuk-service-navigation__link');
  });

  it('Renders user location if set', () => {
    render(<ServiceName session={mockSessionWithLocation} />);

    const locationText = screen.queryByTestId('selected-location');
    expect(locationText).toBeInTheDocument();
    expect(locationText).toHaveTextContent('My test location');

    const changeLink = screen.queryByRole('link', {
      name: 'Change',
    });
    expect(changeLink).toBeInTheDocument();
    expect(changeLink?.getAttribute('href')).toBe('/location-select');
  });

  it('Renders no user location if not set', () => {
    render(<ServiceName session={mockSession} />);

    const locationText = screen.queryByTestId('selected-location');
    const changeLink = screen.queryByRole('link', {
      name: 'Change',
    });
    expect(changeLink).not.toBeInTheDocument();
  });
});
