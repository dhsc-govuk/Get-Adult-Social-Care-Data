import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import FilterPanel, { FilterGroup } from '@/components/filters/FilterPanel';
import {
  ALL_OPTION,
  matchingOptions,
  toChecked,
  toSelected,
  toggleOption,
} from '@/components/filters/filterSelection';
import AnalyticsService from '@/services/analytics/analyticsService';

vi.mock('@/services/analytics/analyticsService', () => ({
  default: { trackFilterApply: vi.fn(), trackFilterClear: vi.fn() },
}));

const groups: FilterGroup[] = [
  {
    id: 'ratings',
    label: 'CQC rating',
    allLabel: 'All ratings',
    options: [
      { value: 'outstanding', label: 'Outstanding' },
      { value: 'good', label: 'Good' },
    ],
  },
  {
    id: 'la_codes',
    label: 'Local authority',
    allLabel: 'All local authorities',
    options: [
      { value: 'E1', label: 'Mid Suffolk' },
      { value: 'E2', label: 'Surrey' },
    ],
  },
];

const onApply = vi.fn();

const renderPanel = (applied = {}) =>
  render(
    <FilterPanel
      idPrefix="test-filters"
      filterType="test"
      groups={groups}
      applied={applied}
      onApply={onApply}
    />
  );

const open = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Show filters' }));
const group = (name: string) => within(screen.getByRole('group', { name }));
const box = (groupName: string, name: string) =>
  group(groupName).getByRole('checkbox', { name });

describe('filter selection', () => {
  it('replaces "All" with a specific option, and the reverse', () => {
    expect(toggleOption([ALL_OPTION], 'good', true)).toEqual(['good']);
    expect(toggleOption(['good'], 'outstanding', true)).toEqual([
      'good',
      'outstanding',
    ]);
    expect(toggleOption(['good', 'outstanding'], ALL_OPTION, true)).toEqual([
      ALL_OPTION,
    ]);
  });

  it('ticks "All" again when the last option is unticked, and keeps it ticked', () => {
    expect(toggleOption(['good'], 'good', false)).toEqual([ALL_OPTION]);
    expect(toggleOption([ALL_OPTION], ALL_OPTION, false)).toEqual([ALL_OPTION]);
    expect(toggleOption(['good', 'outstanding'], 'good', false)).toEqual([
      'outstanding',
    ]);
  });

  it('treats no selection as "All"', () => {
    expect(toChecked([])).toEqual([ALL_OPTION]);
    expect(toChecked(undefined)).toEqual([ALL_OPTION]);
    expect(toChecked(['good'])).toEqual(['good']);
    const options = groups[0].options;
    expect(toSelected([ALL_OPTION], options)).toEqual([]);
    expect(toSelected([], options)).toEqual([]);
    expect(toSelected(['good'], options)).toEqual(['good']);
  });

  it('applies options in the order they are listed, whatever order they were ticked in', () => {
    expect(toSelected(['good', 'outstanding'], groups[0].options)).toEqual([
      'outstanding',
      'good',
    ]);
  });

  it('matches options by part of their label, whatever the case', () => {
    const options = groups[1].options;
    expect(matchingOptions(options, ' SUFF ')).toEqual([options[0]]);
    expect(matchingOptions(options, '')).toEqual(options);
    expect(matchingOptions(options, 'york')).toEqual([]);
  });
});

describe('FilterPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gives each filter a third of the panel, or a quarter when there are more than three', () => {
    const column = (name: string) =>
      screen.getByRole('group', { name }).parentElement;
    const { unmount } = renderPanel();
    open();
    expect(column('CQC rating')).toHaveClass('govuk-grid-column-one-third');
    unmount();

    render(
      <FilterPanel
        idPrefix="test-filters"
        filterType="test"
        groups={['a', 'b', 'c', 'd'].map((id) => ({
          ...groups[0],
          id,
          label: `Filter ${id}`,
        }))}
        applied={{}}
        onApply={onApply}
      />
    );
    open();
    expect(column('Filter a')).toHaveClass('govuk-grid-column-one-quarter');
  });

  it('opens and closes, changing the button text', () => {
    renderPanel();
    const button = screen.getByRole('button', { name: 'Show filters' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveTextContent('Hide filters');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('group')).toHaveLength(2);

    fireEvent.click(button);
    expect(button).toHaveTextContent('Show filters');
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('ticks "All" for filters with nothing applied and the applied options otherwise', () => {
    renderPanel({ ratings: ['good'] });
    open();
    expect(box('CQC rating', 'Good')).toBeChecked();
    expect(box('CQC rating', 'All ratings')).not.toBeChecked();
    expect(box('Local authority', 'All local authorities')).toBeChecked();
  });

  it('unticks "All" when a specific option is ticked, and the reverse', () => {
    renderPanel();
    open();
    fireEvent.click(box('CQC rating', 'Good'));
    expect(box('CQC rating', 'All ratings')).not.toBeChecked();

    fireEvent.click(box('CQC rating', 'All ratings'));
    expect(box('CQC rating', 'Good')).not.toBeChecked();
    expect(box('CQC rating', 'All ratings')).toBeChecked();
  });

  it('shows only the options matching a search', () => {
    renderPanel();
    open();
    fireEvent.change(
      group('Local authority').getByRole('textbox', {
        name: 'Search local authority options',
      }),
      { target: { value: 'sur' } }
    );
    expect(group('Local authority').getAllByRole('checkbox')).toHaveLength(1);
    expect(box('Local authority', 'Surrey')).toBeInTheDocument();
    // Other filters are not searched
    expect(group('CQC rating').getAllByRole('checkbox')).toHaveLength(3);
  });

  it('says when no options match a search', () => {
    renderPanel();
    open();
    fireEvent.change(group('CQC rating').getByRole('textbox'), {
      target: { value: 'zzz' },
    });
    expect(group('CQC rating').queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      group('CQC rating').getByText('No options match your search')
    ).toBeInTheDocument();
  });

  it('applies every filter together and closes', () => {
    renderPanel();
    open();
    fireEvent.click(box('CQC rating', 'Good'));
    fireEvent.click(box('CQC rating', 'Outstanding'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith({
      ratings: ['outstanding', 'good'],
      la_codes: [],
    });
    expect(AnalyticsService.trackFilterApply).toHaveBeenCalledWith(
      ['outstanding', 'good'],
      'test'
    );
    const button = screen.getByRole('button', { name: 'Show filters' });
    expect(button).toHaveFocus();
  });

  it('ticks "All" again when the last option is unticked, and applies no filter', () => {
    renderPanel({ ratings: ['good'] });
    open();
    fireEvent.click(box('CQC rating', 'Good'));
    expect(box('CQC rating', 'All ratings')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledWith({ ratings: [], la_codes: [] });
  });

  it('clears every filter', () => {
    renderPanel({ ratings: ['good'], la_codes: ['E1'] });
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onApply).toHaveBeenCalledWith({ ratings: [], la_codes: [] });
    expect(AnalyticsService.trackFilterClear).toHaveBeenCalledWith('test');
  });

  it('discards changes that were not applied when closed', () => {
    renderPanel({ ratings: ['good'] });
    open();
    fireEvent.click(box('CQC rating', 'Outstanding'));
    fireEvent.click(screen.getByRole('button', { name: 'Hide filters' }));
    expect(onApply).not.toHaveBeenCalled();

    open();
    expect(box('CQC rating', 'Outstanding')).not.toBeChecked();
    expect(box('CQC rating', 'Good')).toBeChecked();
  });

  it('draws only the first options of a long list, ticked ones first', () => {
    const providers: FilterGroup = {
      id: 'provider_codes',
      label: 'Care provider',
      allLabel: 'All care providers',
      options: Array.from({ length: 150 }, (_, i) => ({
        value: `p${i}`,
        label: `Provider ${i}`,
      })),
    };
    render(
      <FilterPanel
        idPrefix="test-filters"
        filterType="test"
        groups={[providers]}
        applied={{ provider_codes: ['p140'] }}
        onApply={onApply}
      />
    );
    open();
    const boxes = group('Care provider').getAllByRole('checkbox');
    expect(boxes).toHaveLength(100);
    expect(boxes[1]).toHaveAccessibleName('Provider 140');
    expect(
      screen.getByText(/Showing the first 100 of 151 options/)
    ).toBeInTheDocument();
  });
});
