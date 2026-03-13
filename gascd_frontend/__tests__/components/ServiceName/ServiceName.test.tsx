import { render, screen } from '@testing-library/react';
import ServiceName from '@/components/common/service-name/ServiceName';
import {
  mockSession,
  mockSessionLAUser,
  mockSessionWithLocation,
} from '@/test-utils/test-utils';

vi.mock('@/services/logger/logService');
vi.mock('@/services/indicator/IndicatorFetchService');
vi.mock('@/services/location/LocationService');

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

  it('Does not show LA topics to CP users', async () => {
    render(<ServiceName session={mockSession} />);
    const lalink = screen.queryByText('Future planning');
    expect(lalink).not.toBeInTheDocument();
  });

  it('Shows LA topics to LA users', async () => {
    render(<ServiceName session={mockSessionLAUser} />);
    const lalink = screen.queryByText('Future planning');
    expect(lalink).toBeInTheDocument();
    expect(lalink?.getAttribute('href')).toBe(
      '/topics/future-planning/subtopics'
    );
  });
});
