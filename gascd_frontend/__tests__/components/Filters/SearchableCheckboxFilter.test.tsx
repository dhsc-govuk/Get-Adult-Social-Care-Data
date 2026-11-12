import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import SearchableCheckboxFilter from '@/components/filters/SearchableCheckboxFilter';

vi.mock('@/services/analytics/analyticsService');
vi.mock('next/navigation', () => ({ useRouter: () => ({}) }));

const options = [
  { value: 'domiciliary_care', label: 'Domiciliary care service' },
  { value: 'supported_living', label: 'Supported living service' },
  { value: 'care_home_nursing', label: 'Care home service with nursing' },
];

const renderFilter = (applied: string[] = []) => {
  const onApply = vi.fn();
  render(
    <SearchableCheckboxFilter
      idPrefix="service-type"
      label="Service type"
      allLabel="All service types"
      options={options}
      applied={applied}
      onApply={onApply}
      noMatchesText="No service types match your search"
      analyticsId="service-type"
    />
  );
  return onApply;
};

const open = () =>
  fireEvent.click(screen.getByRole('button', { name: /Show filters/ }));
const checkbox = (name: string) => screen.getByRole('checkbox', { name });
const checkedLabels = () =>
  screen
    .getAllByRole('checkbox')
    .filter((input) => (input as HTMLInputElement).checked)
    .map((input) => (input as HTMLInputElement).value);

describe('SearchableCheckboxFilter', () => {
  it('is closed to begin with, and the button opens and closes the panel', () => {
    renderFilter();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    open();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    const hide = screen.getByRole('button', { name: /Hide filters/ });
    expect(hide).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(hide);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Show filters/ })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('has only the "all" option selected when nothing is applied', () => {
    renderFilter();
    open();
    expect(checkedLabels()).toEqual(['all']);
  });

  it('deselects "all" when an option is chosen, and the options when "all" is chosen', () => {
    renderFilter();
    open();

    fireEvent.click(checkbox('Domiciliary care service'));
    fireEvent.click(checkbox('Supported living service'));
    expect(checkedLabels()).toEqual(['domiciliary_care', 'supported_living']);

    fireEvent.click(checkbox('All service types'));
    expect(checkedLabels()).toEqual(['all']);
  });

  it('applies the chosen options in the order they are listed, and closes', () => {
    const onApply = renderFilter();
    open();
    fireEvent.click(checkbox('Care home service with nursing'));
    fireEvent.click(checkbox('Domiciliary care service'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith([
      'domiciliary_care',
      'care_home_nursing',
    ]);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('applies no filter when every option is deselected', () => {
    const onApply = renderFilter(['domiciliary_care']);
    open();
    fireEvent.click(checkbox('Domiciliary care service'));
    expect(checkedLabels()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith([]);
  });

  it('clears the filter with "Clear all"', () => {
    const onApply = renderFilter(['domiciliary_care', 'supported_living']);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(onApply).toHaveBeenCalledWith([]);
  });

  it('discards unapplied selections when the panel is closed', () => {
    const onApply = renderFilter(['supported_living']);
    open();
    fireEvent.click(checkbox('Domiciliary care service'));
    fireEvent.click(screen.getByRole('button', { name: /Hide filters/ }));

    expect(onApply).not.toHaveBeenCalled();
    open();
    expect(checkedLabels()).toEqual(['supported_living']);
  });

  it('lists only the options matching the search', () => {
    renderFilter();
    open();
    fireEvent.change(screen.getByLabelText('Service type search'), {
      target: { value: 'care home' },
    });

    expect(
      screen
        .getAllByRole('checkbox')
        .map((input) => input.getAttribute('value'))
    ).toEqual(['care_home_nursing']);
  });

  it('says so when the search matches nothing', () => {
    renderFilter();
    open();
    fireEvent.change(screen.getByLabelText('Service type search'), {
      target: { value: 'hospital' },
    });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.getByText('No service types match your search')
    ).toBeInTheDocument();
  });
});
