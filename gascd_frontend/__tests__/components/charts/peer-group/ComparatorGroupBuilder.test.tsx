import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ComparatorGroupBuilder, {
  validateGroupName,
} from '@/components/charts/peer-group/ComparatorGroupBuilder';
import { LocalAuthoritySummary } from '@/components/charts/peer-group/types';

const authorities: LocalAuthoritySummary[] = [
  { laCode: 'E08000014', laName: 'Liverpool', regionName: 'North West' },
  { laCode: 'E08000015', laName: 'Manchester', regionName: 'North West' },
  { laCode: 'E08000018', laName: 'Sheffield', regionName: 'North West' },
];

const renderBuilder = (
  overrides: Partial<React.ComponentProps<typeof ComparatorGroupBuilder>> = {}
) => {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <ComparatorGroupBuilder
      idPrefix="test"
      allAuthorities={authorities}
      authoritiesError={false}
      existingNames={[]}
      onSave={onSave}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onSave, onCancel };
};

describe('ComparatorGroupBuilder', () => {
  it('renders the panel with name input, search, checkboxes and buttons', () => {
    renderBuilder();
    expect(
      screen.getByRole('heading', { name: /create a custom comparator group/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/name this comparator group/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/select local authorities/i)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getByText('0 selected')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it("excludes the user's own authority from the list", () => {
    renderBuilder({ ownLaCode: 'E08000015' });
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(
      screen.queryByRole('checkbox', { name: 'Manchester' })
    ).not.toBeInTheDocument();
  });

  it('filters authorities via the search box', async () => {
    renderBuilder();
    await userEvent.type(
      screen.getByLabelText(/select local authorities/i),
      'sheff'
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(
      screen.getByRole('checkbox', { name: 'Sheffield' })
    ).toBeInTheDocument();
  });

  it('keeps ticked authorities selected while filtered out of view', async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Liverpool' }));
    await userEvent.type(
      screen.getByLabelText(/select local authorities/i),
      'sheff'
    );
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('updates the selected count and supports Clear all', async () => {
    renderBuilder();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Liverpool' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Sheffield' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.getByText('0 selected')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /clear all/i })
    ).not.toBeInTheDocument();
  });

  it('shows validation errors for a missing name and empty selection', async () => {
    const { onSave } = renderBuilder();
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );
    expect(
      screen.getByText('Enter a name for this comparator group')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Select at least one local authority')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('rejects a duplicate group name', async () => {
    const { onSave } = renderBuilder({ existingNames: ['My Group'] });
    await userEvent.type(
      screen.getByLabelText(/name this comparator group/i),
      'my group'
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Liverpool' }));
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );
    expect(
      screen.getByText('A comparator group with this name already exists')
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a valid group with the trimmed name and selected codes', async () => {
    const { onSave } = renderBuilder();
    await userEvent.type(
      screen.getByLabelText(/name this comparator group/i),
      '  Custom group 1  '
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Liverpool' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Sheffield' }));
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );
    expect(onSave).toHaveBeenCalledWith({
      name: 'Custom group 1',
      laCodes: ['E08000014', 'E08000018'],
    });
  });

  it('disables the buttons while a save is in flight, preventing double-submission', async () => {
    let resolveSave!: () => void;
    const onSave = vi.fn(
      () => new Promise<void>((resolve) => (resolveSave = resolve))
    );
    renderBuilder({ onSave });

    await userEvent.type(
      screen.getByLabelText(/name this comparator group/i),
      'Pending group'
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Liverpool' }));

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();

    // A second click while pending must not fire another save
    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);

    resolveSave();
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it('fires onCancel from the Cancel button', async () => {
    const { onCancel } = renderBuilder();
    await userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows a loading message while authorities are loading', () => {
    renderBuilder({ allAuthorities: null });
    expect(
      screen.getByText(/loading local authorities/i)
    ).toBeInTheDocument();
  });

  it('shows an error message when the list failed to load', () => {
    renderBuilder({ allAuthorities: null, authoritiesError: true });
    expect(
      screen.getByText(/could not be loaded/i)
    ).toBeInTheDocument();
  });

  describe('edit mode', () => {
    const editProps = {
      mode: 'edit' as const,
      initialName: 'My group',
      initialCodes: ['E08000014'],
      onDelete: vi.fn(),
    };

    it('prefills the form and shows the edit heading', () => {
      renderBuilder(editProps);
      expect(
        screen.getByRole('heading', { name: /edit comparator group/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/name this comparator group/i)).toHaveValue(
        'My group'
      );
      expect(
        screen.getByRole('checkbox', { name: 'Liverpool' })
      ).toBeChecked();
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('saves the edited name and members', async () => {
      const { onSave } = renderBuilder(editProps);
      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Sheffield' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );
      expect(onSave).toHaveBeenCalledWith({
        name: 'My group',
        laCodes: ['E08000014', 'E08000018'],
      });
    });

    it('allows keeping the same name when existingNames excludes it', async () => {
      // The page passes existingNames without the edited group's own name
      const { onSave } = renderBuilder({ ...editProps, existingNames: [] });
      await userEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );
      expect(onSave).toHaveBeenCalled();
    });

    it('requires confirmation before deleting, and can be backed out of', async () => {
      const onDelete = vi.fn();
      renderBuilder({ ...editProps, onDelete });

      await userEvent.click(
        screen.getByRole('button', { name: /delete this group/i })
      );
      const confirmation = screen.getByText(/are you sure you want to delete/i);
      expect(confirmation).toBeInTheDocument();
      expect(confirmation).toHaveFocus();
      expect(onDelete).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole('button', { name: /keep group/i }));
      expect(
        screen.queryByText(/are you sure you want to delete/i)
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
      expect(onDelete).not.toHaveBeenCalled();
    });

    it('fires onDelete after confirmation', async () => {
      const onDelete = vi.fn();
      renderBuilder({ ...editProps, onDelete });

      await userEvent.click(
        screen.getByRole('button', { name: /delete this group/i })
      );
      await userEvent.click(
        screen.getByRole('button', { name: /yes, delete group/i })
      );
      expect(onDelete).toHaveBeenCalled();
    });

    it('does not show a delete button in create mode', () => {
      renderBuilder();
      expect(
        screen.queryByRole('button', { name: /delete this group/i })
      ).not.toBeInTheDocument();
    });
  });
});

describe('validateGroupName', () => {
  it.each([
    ['', 'Enter a name for this comparator group'],
    ['   ', 'Enter a name for this comparator group'],
    [
      'a'.repeat(61),
      'The group name must be 60 characters or fewer',
    ],
    [
      '=HYPERLINK("http://evil")',
      'The group name must only include letters, numbers, spaces and basic punctuation',
    ],
    [
      '<script>alert(1)</script>',
      'The group name must only include letters, numbers, spaces and basic punctuation',
    ],
  ])('rejects %j', (name, expectedError) => {
    expect(validateGroupName(name, [])).toBe(expectedError);
  });

  it('accepts names with letters, numbers and basic punctuation', () => {
    expect(validateGroupName("Bob's group (North & South), v2", [])).toBe(
      undefined
    );
  });
});
