import FiltersList from '@/components/indicator-components/Filters';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const BarChartTest = () => {
  const [filters, setFilters] = useState<TotalBedsFilters[]>([
    { metric_id: '1', filter_bedtype: 'First', checked: false },
    { metric_id: '2', filter_bedtype: 'Second', checked: false },
    { metric_id: '3', filter_bedtype: 'Third', checked: false },
  ]);

  const handleRadioChange = (selectedIndex: number) => {
    const updatedFilters = filters.map((filter, index) => ({
      ...filter,
      checked: index === selectedIndex,
    }));

    setFilters(updatedFilters);
  };

  return (
    <FiltersList
      filters={filters}
      onChange={handleRadioChange}
      useCheckboxes={false}
    />
  );
};

const TimeSeriesTest = () => {
  const [filters, setFilters] = useState<TotalBedsFilters[]>([
    { metric_id: '1', filter_bedtype: 'First', checked: false },
    { metric_id: '2', filter_bedtype: 'Second', checked: false },
    { metric_id: '3', filter_bedtype: 'Third', checked: false },
  ]);

  const handleCheckboxChange = (index: number, checked?: boolean) => {
    const newFilters = [...filters];
    newFilters[index].checked = checked;
    setFilters(newFilters);
  };

  return (
    <FiltersList
      filters={filters}
      onChange={handleCheckboxChange}
      useCheckboxes={true}
    />
  );
};

describe('Filters List Component', () => {
  it('Renders the bar chart filters correctly', async () => {
    render(<BarChartTest />);
    const firstRadioButton = screen.getByRole('radio', { name: 'First' });
    const radioButtons = screen.getAllByRole('radio');

    expect(firstRadioButton).not.toBeChecked();
    expect(firstRadioButton.getAttribute('value')).toBe('1');
    expect(radioButtons.length).toBe(3);

    await userEvent.click(firstRadioButton);
    expect(firstRadioButton).toBeChecked();
  });

  it('Renders the time series filters correctly', async () => {
    render(<TimeSeriesTest />);
    const firstCheckboxButton = screen.getByRole('checkbox', { name: 'First' });
    const checkboxButtons = screen.getAllByRole('checkbox');

    expect(firstCheckboxButton).not.toBeChecked();
    expect(firstCheckboxButton.getAttribute('value')).toBe('1');
    expect(checkboxButtons.length).toBe(3);

    await userEvent.click(firstCheckboxButton);
    expect(firstCheckboxButton).toBeChecked();
  });

  it('Shows "Loading filters..." when the filters list is empty for bar chart', () => {
    render(
      <FiltersList filters={[]} onChange={() => {}} useCheckboxes={false} />
    );
    expect(screen.getByText('Loading filters...')).toBeInTheDocument();
  });

  it('Shows "Loading filters..." when filters list is empty for time series', () => {
    render(
      <FiltersList filters={[]} onChange={() => {}} useCheckboxes={true} />
    );
    expect(screen.getByText('Loading filters...')).toBeInTheDocument();
  });
});
