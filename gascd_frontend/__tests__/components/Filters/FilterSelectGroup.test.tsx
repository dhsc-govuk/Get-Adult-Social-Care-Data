import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import FilterSelectGroup from '@/components/filters/FilterSelectGroup';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/services/analytics/analyticsService', () => ({
  default: { trackFilterApply: vi.fn(), trackFilterRemove: vi.fn() },
}));

const renderFilter = () =>
  render(
    <FilterSelectGroup
      filterType="duration"
      filterLabel="Duration of care"
      filters={{
        stlt: 'Long & short-term',
        lt: 'Long-term only',
        st: 'Short-term only',
      }}
      secondaryFilterType="setting"
      secondaryFilterLabel="Support setting"
      secondaryFilters={{ total: 'All types', nursing: 'Nursing' }}
      secondaryHiddenFor={['stlt']}
      updateMethod={() => {}}
    />
  );

const open = () => fireEvent.click(screen.getByText('Show filters'));

describe('FilterSelectGroup', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to the first option, which hides the second select', () => {
    renderFilter();
    open();
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('stlt');
    expect(screen.queryByText('Support setting')).not.toBeInTheDocument();
  });

  it('shows the second select for the other options', () => {
    renderFilter();
    open();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'lt' },
    });
    expect(screen.getByText('Support setting')).toBeInTheDocument();
  });

  it('saves the default and clears a stale second selection on apply', () => {
    localStorage.setItem(
      'setting',
      JSON.stringify({ metric_id: 'nursing', filter_bedtype: 'Nursing' })
    );
    renderFilter();
    open();
    fireEvent.click(screen.getByText('Apply'));
    expect(JSON.parse(localStorage.getItem('duration')!).metric_id).toBe(
      'stlt'
    );
    expect(localStorage.getItem('setting')).toBeNull();
  });

  it('lists the support setting in the active filters when it applies', () => {
    renderFilter();
    open();
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'st' },
    });
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'nursing' },
    });
    fireEvent.click(screen.getByText('Apply'));
    expect(
      screen.getByText('Duration of care: Short-term only')
    ).toBeInTheDocument();
    expect(screen.getByText('Support setting: Nursing')).toBeInTheDocument();

    // Removing it keeps the duration
    fireEvent.click(screen.getByText('Support setting: Nursing'));
    expect(screen.queryByText(/Support setting:/)).not.toBeInTheDocument();
    expect(
      screen.getByText('Duration of care: Short-term only')
    ).toBeInTheDocument();
    expect(localStorage.getItem('setting')).toBeNull();
  });

  it('leaves the support setting out for long & short-term', () => {
    renderFilter();
    open();
    fireEvent.click(screen.getByText('Apply'));
    expect(
      screen.getByText('Duration of care: Long & short-term')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Support setting:/)).not.toBeInTheDocument();
  });
});
