'use client';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import FilterBox from './FilterBox';
import AnalyticsService from '@/services/analytics/analyticsService';

type Option = { value: string; label: string };

type Props = {
  // Keeps element ids unique when the same filter is shown in several tabs
  idPrefix: string;
  // The heading of the filter, e.g. "Service type"
  label: string;
  // The option standing for no filter, e.g. "All service types"
  allLabel: string;
  options: Option[];
  // The applied options; none means the "all" option applies
  applied: string[];
  onApply: (values: string[]) => void;
  // Shown when the search matches nothing
  noMatchesText: string;
  // What the filter is tracked under
  analyticsId: string;
};

const ALL_VALUE = 'all';

/**
 * A "Show filters" button opening a panel of searchable checkboxes, with an
 * "all" option that stands for no filter. Selections only take effect on
 * "Apply": closing the panel discards them.
 *
 * `FilterCheckboxGroup` is the bed type filter this follows the look of; it
 * keeps its selections in local storage and has no "all" option, so it is not
 * reused here, where the applied selection is shared between tabs by the page.
 */
const SearchableCheckboxFilter: React.FC<Props> = ({
  idPrefix,
  label,
  allLabel,
  options,
  applied,
  onApply,
  noMatchesText,
  analyticsId,
}) => {
  const [open, setOpen] = useState(false);
  // What is ticked in the open panel, before it is applied
  const [selected, setSelected] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(true);
  const [search, setSearch] = useState('');

  const toggleOpen = () => {
    if (!open) {
      // Start from what is applied, discarding anything left unapplied
      setSelected(applied);
      setAllSelected(applied.length === 0);
      setSearch('');
    }
    setOpen(!open);
  };

  const toggleAll = (checked: boolean) => {
    setAllSelected(checked);
    if (checked) setSelected([]);
  };

  const toggleOption = (value: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value)
    );
    if (checked) setAllSelected(false);
  };

  const apply = () => {
    // In the order the options are listed, whatever order they were ticked in
    const values = allSelected
      ? []
      : options
          .map((option) => option.value)
          .filter((value) => selected.includes(value));
    if (values.length) AnalyticsService.trackFilterApply(values, analyticsId);
    else AnalyticsService.trackFilterClear(analyticsId);
    onApply(values);
    setOpen(false);
  };

  const clearAll = () => {
    AnalyticsService.trackFilterClear(analyticsId);
    onApply([]);
    setOpen(false);
  };

  const matches = [{ value: ALL_VALUE, label: allLabel }, ...options].filter(
    (option) => option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="govuk-!-padding-bottom-4">
      <div className="dhsc-filter--action">
        <button
          id={`${idPrefix}-button`}
          className={`govuk-button ${open ? 'dhsc-filter--open' : 'dhsc-filter--closed'}`}
          type="button"
          aria-expanded={open}
          onClick={toggleOpen}
        >
          <span className="dhsc-filter--button-content">
            {open ? 'Hide' : 'Show'} filters
          </span>
          <FontAwesomeIcon
            className="govuk-!-margin-left-2"
            icon={open ? faMinus : faPlus}
            aria-hidden="true"
          />
        </button>
      </div>
      {open && (
        <FilterBox idPrefix={idPrefix}>
          <div className="js-container-heading">
            <h4 className="govuk-heading-s searchable-filters-heading">
              {label}
            </h4>
          </div>
          <div className="app-c-option-select__filter">
            <label
              htmlFor={`${idPrefix}-search-input`}
              className="govuk-label govuk-visually-hidden"
            >
              {label} search
            </label>
            <input
              id={`${idPrefix}-search-input`}
              className="app-c-option-select__filter-input govuk-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="gem-c-checkboxes govuk-form-group govuk-checkboxes--small">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-visually-hidden">
                {label}
              </legend>
              {matches.length === 0 && (
                <p className="govuk-body govuk-!-margin-top-2" role="status">
                  {noMatchesText}
                </p>
              )}
              <ul className="govuk-checkboxes gem-c-checkboxes__list">
                {matches.map((option) => {
                  const isAll = option.value === ALL_VALUE;
                  const inputId = `${idPrefix}-${option.value}`;
                  return (
                    <li className="govuk-checkboxes__item" key={option.value}>
                      <input
                        className="govuk-checkboxes__input"
                        id={inputId}
                        type="checkbox"
                        value={option.value}
                        checked={
                          isAll ? allSelected : selected.includes(option.value)
                        }
                        onChange={(e) =>
                          isAll
                            ? toggleAll(e.target.checked)
                            : toggleOption(option.value, e.target.checked)
                        }
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={inputId}
                      >
                        {option.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          </div>
          <div className="govuk-button-group govuk-!-margin-top-4">
            <button type="button" className="govuk-button" onClick={apply}>
              Apply
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={clearAll}
            >
              Clear all
            </button>
          </div>
        </FilterBox>
      )}
    </div>
  );
};

export default SearchableCheckboxFilter;
