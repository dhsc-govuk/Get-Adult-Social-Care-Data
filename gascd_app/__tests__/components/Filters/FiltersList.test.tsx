import FiltersList from '@/components/indicator-components/Filters';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

const BarChartTest = () => {
  const [filters, setFilters] = useState<TotalBedsFilters[]>([
    {
      metric_id: '1',
      filter_bedtype: 'First',
      checked: false,
    },
    {
      metric_id: '2',
      filter_bedtype: 'Second',
      checked: false,
    },
    {
      metric_id: '3',
      filter_bedtype: 'Third',
      checked: false,
    },
  ]);

  const handleRadioChange = (selectedIndex: number) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter, index) => ({
        ...filter,
        checked: index === selectedIndex,
      }))
    );
  };

  return <FiltersList filters={filters} onChange={handleRadioChange} />;
};

describe('Filters List Component', () => {
  it('Renders the component correctly', () => {
    render(<BarChartTest />);
    const firstRadioButton = screen.getByRole('radio', { name: 'First' });
    const radioButtons = screen.getAllByRole('radio');
    expect(firstRadioButton).not.toBeChecked();
    expect(firstRadioButton.getAttribute('value')).toBe('1');
    expect(radioButtons.length).toBe(3);
  });
});
