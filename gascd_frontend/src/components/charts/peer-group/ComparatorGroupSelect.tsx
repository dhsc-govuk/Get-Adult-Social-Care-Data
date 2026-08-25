'use client';
import React, { useEffect, useRef } from 'react';
import {
  CUSTOM_GROUP_VALUE_PREFIX,
  CUSTOM_NEW_VALUE,
  NHS_PEER_GROUP_LABEL,
  NHS_PEER_GROUP_VALUE,
} from './constants';
import { ComparatorSelection, CustomComparatorGroup } from './types';

interface ComparatorGroupSelectProps {
  idPrefix: string;
  selection: ComparatorSelection;
  groups: CustomComparatorGroup[];
  onChange: (selection: ComparatorSelection) => void;
  // When provided, a "Custom" option is shown; choosing it calls this instead
  // of changing the selection (the builder panel opens).
  onCreateNew?: () => void;
  // When provided and a custom group is selected, an "Edit this group" button
  // is shown that opens the builder prefilled with that group.
  onEdit?: () => void;
  // Which builder panel is open for this control, if any. While creating, the
  // select displays "Custom"; while editing, it keeps showing the group name.
  builderMode?: 'create' | 'edit' | null;
}

const ComparatorGroupSelect: React.FC<ComparatorGroupSelectProps> = ({
  idPrefix,
  selection,
  groups,
  onChange,
  onCreateNew,
  onEdit,
  builderMode = null,
}) => {
  const selectId = `${idPrefix}-comparison-group`;
  const selectRef = useRef<HTMLSelectElement>(null);
  const builderOpen = builderMode !== null;
  const prevBuilderOpen = useRef(builderOpen);

  // When the builder closes (save or cancel), return focus to the select so
  // keyboard and screen reader users land back on the control, which now
  // announces the resulting selection.
  useEffect(() => {
    if (prevBuilderOpen.current && !builderOpen) {
      selectRef.current?.focus();
    }
    prevBuilderOpen.current = builderOpen;
  }, [builderOpen]);

  const currentValue =
    builderMode === 'create'
      ? CUSTOM_NEW_VALUE
      : selection.kind === 'custom'
        ? `${CUSTOM_GROUP_VALUE_PREFIX}${selection.groupId}`
        : NHS_PEER_GROUP_VALUE;

  const handleChange = (value: string) => {
    if (value === CUSTOM_NEW_VALUE) {
      onCreateNew?.();
      return;
    }
    if (value.startsWith(CUSTOM_GROUP_VALUE_PREFIX)) {
      onChange({
        kind: 'custom',
        groupId: value.slice(CUSTOM_GROUP_VALUE_PREFIX.length),
      });
      return;
    }
    onChange({ kind: 'nhs_peer_group' });
  };

  const showEditButton = Boolean(
    onEdit && selection.kind === 'custom' && builderMode !== 'create'
  );

  return (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-!-font-weight-bold"
        htmlFor={selectId}
      >
        Comparison group
      </label>
      <select
        ref={selectRef}
        id={selectId}
        className="govuk-select"
        value={currentValue}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Select comparison group"
      >
        <option value={NHS_PEER_GROUP_VALUE}>{NHS_PEER_GROUP_LABEL}</option>
        {groups.map((group) => (
          <option
            key={group.id}
            value={`${CUSTOM_GROUP_VALUE_PREFIX}${group.id}`}
          >
            {group.name}
          </option>
        ))}
        {onCreateNew && <option value={CUSTOM_NEW_VALUE}>Custom</option>}
      </select>
      {showEditButton && (
        <button
          type="button"
          className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-0"
          aria-expanded={builderMode === 'edit'}
          onClick={onEdit}
        >
          Edit this group
        </button>
      )}
    </div>
  );
};

export default ComparatorGroupSelect;
