import { render, screen } from '@testing-library/react';
import ServiceName from '@/components/common/service-name/ServiceName';

describe('Service Component', () => {
  it('Renders the component correctly', () => {
    render(<ServiceName />);
    const titleText = screen.getByText('Get adult social care data');
    expect(titleText).toBeInTheDocument();
    expect(titleText).toHaveClass('govuk-service-navigation__link');
  });
});
