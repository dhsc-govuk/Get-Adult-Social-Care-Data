'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LocalAuthoritySummary } from './types';
import {
  GROUP_NAME_MAX_LENGTH,
  validateGroupName,
} from '@/lib/comparatorGroups';

// Re-exported for existing consumers/tests
export { GROUP_NAME_MAX_LENGTH, validateGroupName };

interface ComparatorGroupBuilderProps {
  idPrefix: string;
  allAuthorities: LocalAuthoritySummary[] | null;
  authoritiesError: boolean;
  // The user's own authority is excluded from the pickable list - it is always
  // included in the chart in its own right.
  ownLaCode?: string;
  // Names the new/edited name must not clash with. When editing, the caller
  // must exclude the edited group's own current name.
  existingNames: string[];
  onSave: (group: { name: string; laCodes: string[] }) => void | Promise<void>;
  onCancel: () => void;
  // Edit mode: prefills the form and shows a delete action.
  mode?: 'create' | 'edit';
  initialName?: string;
  initialCodes?: string[];
  onDelete?: () => void | Promise<void>;
  // A save/delete failure reported by the server (e.g. network error) -
  // shown above the buttons so the user knows their change was not stored.
  serverError?: string;
}

interface BuilderErrors {
  name?: string;
  selection?: string;
}

const ComparatorGroupBuilder: React.FC<ComparatorGroupBuilderProps> = ({
  idPrefix,
  allAuthorities,
  authoritiesError,
  ownLaCode,
  existingNames,
  onSave,
  onCancel,
  mode = 'create',
  initialName = '',
  initialCodes = [],
  onDelete,
  serverError,
}) => {
  const [name, setName] = useState(initialName);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initialCodes);
  const [errors, setErrors] = useState<BuilderErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, setPending] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const deleteConfirmRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (confirmingDelete) {
      deleteConfirmRef.current?.focus();
    }
  }, [confirmingDelete]);

  const selectableAuthorities = useMemo(
    () =>
      (allAuthorities ?? []).filter(
        (authority) => authority.laCode !== ownLaCode
      ),
    [allAuthorities, ownLaCode]
  );

  const searchedAuthorities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return selectableAuthorities;
    return selectableAuthorities.filter((authority) =>
      authority.laName.toLowerCase().includes(term)
    );
  }, [selectableAuthorities, searchTerm]);

  const handleCheckboxChange = (laCode: string, checked: boolean) => {
    setSelectedCodes((current) =>
      checked ? [...current, laCode] : current.filter((code) => code !== laCode)
    );
  };

  const handleSave = async () => {
    if (pending) return;
    const newErrors: BuilderErrors = {
      name: validateGroupName(name, existingNames),
      selection:
        selectedCodes.length === 0
          ? 'Select at least one local authority'
          : undefined,
    };
    if (newErrors.name || newErrors.selection) {
      setErrors(newErrors);
      return;
    }
    // Disable the buttons while the request is in flight so a double-click
    // cannot submit the same group twice
    setPending(true);
    try {
      await onSave({ name: name.trim(), laCodes: selectedCodes });
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (pending || !onDelete) return;
    setPending(true);
    try {
      await onDelete();
    } finally {
      setPending(false);
    }
  };

  const nameInputId = `${idPrefix}-group-name`;
  const searchInputId = `${idPrefix}-la-search`;

  return (
    <div
      className="govuk-!-padding-4 govuk-!-margin-bottom-4"
      style={{ border: '2px solid #0b0c0c' }}
    >
      <h3 className="govuk-heading-s">
        {mode === 'edit'
          ? 'Edit comparator group'
          : 'Create a custom comparator group'}
      </h3>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <div
            className={`govuk-form-group ${errors.name ? 'govuk-form-group--error' : ''}`}
          >
            <label className="govuk-label" htmlFor={nameInputId}>
              Name this comparator group
            </label>
            {errors.name && (
              <p id={`${nameInputId}-error`} className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span>{' '}
                {errors.name}
              </p>
            )}
            <input
              ref={nameInputRef}
              id={nameInputId}
              className={`govuk-input ${errors.name ? 'govuk-input--error' : ''}`}
              type="text"
              value={name}
              maxLength={GROUP_NAME_MAX_LENGTH}
              aria-describedby={errors.name ? `${nameInputId}-error` : undefined}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div
            className={`govuk-form-group ${errors.selection ? 'govuk-form-group--error' : ''}`}
          >
            <label className="govuk-label" htmlFor={searchInputId}>
              Select local authorities
            </label>
            {errors.selection && (
              <p id={`${searchInputId}-error`} className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span>{' '}
                {errors.selection}
              </p>
            )}
            <div className="app-c-option-select__container js-options-container">
              <input
                id={searchInputId}
                className="app-c-option-select__filter-input govuk-input"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="js-container-heading govuk-!-margin-top-2">
              <p className="app-c-option-select__selected-counter js-selected-counter">
                {selectedCodes.length} selected
              </p>
              {selectedCodes.length > 0 && (
                <button
                  type="button"
                  className="govuk-link govuk-body-s app-c-filter-summary__remove-filter"
                  onClick={() => setSelectedCodes([])}
                >
                  Clear all
                </button>
              )}
            </div>
            {allAuthorities === null && !authoritiesError && (
              <p className="govuk-body-s">Loading local authorities...</p>
            )}
            {authoritiesError && (
              <p className="govuk-body-s">
                The list of local authorities could not be loaded. Try again
                later.
              </p>
            )}
            {allAuthorities !== null && (
              <div
                role="group"
                className="app-c-option-select__container js-options-container"
                tabIndex={-1}
              >
                <div className="app-c-option-select__container-inner js-auto-height-inner">
                  <div className="gem-c-checkboxes govuk-form-group govuk-checkboxes--small">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend gem-c-checkboxes__legend--hidden">
                        Select local authorities
                      </legend>
                      <ul className="govuk-checkboxes gem-c-checkboxes__list">
                        {searchedAuthorities.map((authority) => (
                          <li
                            className="govuk-checkboxes__item"
                            key={authority.laCode}
                          >
                            <input
                              className="govuk-checkboxes__input"
                              id={`${idPrefix}-la-${authority.laCode}`}
                              type="checkbox"
                              value={authority.laCode}
                              checked={selectedCodes.includes(authority.laCode)}
                              onChange={(event) =>
                                handleCheckboxChange(
                                  authority.laCode,
                                  event.target.checked
                                )
                              }
                            />
                            <label
                              className="govuk-label govuk-checkboxes__label"
                              htmlFor={`${idPrefix}-la-${authority.laCode}`}
                            >
                              {authority.laName}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </fieldset>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {serverError && (
        <p className="govuk-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span> {serverError}
        </p>
      )}
      {confirmingDelete ? (
        <div>
          <p
            ref={deleteConfirmRef}
            tabIndex={-1}
            className="govuk-body govuk-!-font-weight-bold"
          >
            Are you sure you want to delete this comparator group? This cannot
            be undone.
          </p>
          <div className="govuk-button-group govuk-!-margin-bottom-0">
            <button
              type="button"
              className="govuk-button govuk-button--warning"
              disabled={pending}
              onClick={handleDelete}
            >
              Yes, delete group
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={pending}
              onClick={() => setConfirmingDelete(false)}
            >
              Keep group
            </button>
          </div>
        </div>
      ) : (
        <div className="govuk-button-group govuk-!-margin-bottom-0">
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            disabled={pending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="govuk-button"
            disabled={pending}
            onClick={handleSave}
          >
            Save changes
          </button>
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              className="govuk-button govuk-button--warning"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete this group
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparatorGroupBuilder;
