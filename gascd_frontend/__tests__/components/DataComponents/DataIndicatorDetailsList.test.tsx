import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import { render, screen } from '@testing-library/react';

describe('DataIndicatorDetailsList', () => {
  it('renders the component correctly', () => {
    render(
      <DataIndicatorDetailsList>
        <li>Test List Item</li>
      </DataIndicatorDetailsList>
    );

    const titleText = screen.getByRole('heading', {
      name: /Data indicator details/i,
      level: 2,
    });
    expect(titleText).toBeInTheDocument();

    const listElement = screen.getByRole('list');
    expect(listElement).toBeInTheDocument();
  });
});
