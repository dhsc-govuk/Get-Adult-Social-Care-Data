import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ComparatorGroupSelect from '@/components/charts/peer-group/ComparatorGroupSelect';
import { CustomComparatorGroup } from '@/components/charts/peer-group/types';

const groups: CustomComparatorGroup[] = [
  { id: 'group-1', name: 'My neighbours', laCodes: ['E08000015'] },
];

describe('ComparatorGroupSelect', () => {
  it('renders the NHS option, saved groups and the Custom option', () => {
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
        onCreateNew={vi.fn()}
      />
    );

    const select = screen.getByRole('combobox', { name: /comparison group/i });
    expect(select).toHaveValue('nhs_peer_group');
    expect(
      screen.getByRole('option', {
        name: 'Statistically similar peer group (NHS)',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'My neighbours' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Custom' })).toBeInTheDocument();
  });

  it('omits the Custom option when onCreateNew is not provided', () => {
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
      />
    );
    expect(
      screen.queryByRole('option', { name: 'Custom' })
    ).not.toBeInTheDocument();
  });

  it('fires onChange with a custom selection when a saved group is chosen', async () => {
    const onChange = vi.fn();
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={onChange}
      />
    );

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'custom:group-1'
    );
    expect(onChange).toHaveBeenCalledWith({
      kind: 'custom',
      groupId: 'group-1',
    });
  });

  it('fires onCreateNew instead of onChange when Custom is chosen', async () => {
    const onChange = vi.fn();
    const onCreateNew = vi.fn();
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={onChange}
        onCreateNew={onCreateNew}
      />
    );

    await userEvent.selectOptions(screen.getByRole('combobox'), 'custom');
    expect(onCreateNew).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange with the NHS selection when switching back', async () => {
    const onChange = vi.fn();
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'custom', groupId: 'group-1' }}
        groups={groups}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('custom:group-1');
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'nhs_peer_group'
    );
    expect(onChange).toHaveBeenCalledWith({ kind: 'nhs_peer_group' });
  });

  it('displays Custom while the create builder is open', () => {
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
        onCreateNew={vi.fn()}
        builderMode="create"
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('custom');
  });

  it('keeps showing the group name while the edit builder is open', () => {
    render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'custom', groupId: 'group-1' }}
        groups={groups}
        onChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        builderMode="edit"
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('custom:group-1');
    expect(
      screen.getByRole('button', { name: /edit this group/i })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the edit button only when a custom group is selected', async () => {
    const onEdit = vi.fn();
    const { rerender } = render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
        onEdit={onEdit}
      />
    );
    expect(
      screen.queryByRole('button', { name: /edit this group/i })
    ).not.toBeInTheDocument();

    rerender(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'custom', groupId: 'group-1' }}
        groups={groups}
        onChange={vi.fn()}
        onEdit={onEdit}
      />
    );
    const editButton = screen.getByRole('button', {
      name: /edit this group/i,
    });
    expect(editButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(editButton);
    expect(onEdit).toHaveBeenCalled();
  });

  it('returns focus to the select when the builder closes', () => {
    const { rerender } = render(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
        onCreateNew={vi.fn()}
        builderMode="create"
      />
    );
    rerender(
      <ComparatorGroupSelect
        idPrefix="test"
        selection={{ kind: 'nhs_peer_group' }}
        groups={groups}
        onChange={vi.fn()}
        onCreateNew={vi.fn()}
        builderMode={null}
      />
    );
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('does not collide when two instances render on the same page', () => {
    render(
      <>
        <ComparatorGroupSelect
          idPrefix="one"
          selection={{ kind: 'nhs_peer_group' }}
          groups={[]}
          onChange={vi.fn()}
        />
        <ComparatorGroupSelect
          idPrefix="two"
          selection={{ kind: 'nhs_peer_group' }}
          groups={[]}
          onChange={vi.fn()}
        />
      </>
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(selects[0].id).not.toBe(selects[1].id);
  });
});
