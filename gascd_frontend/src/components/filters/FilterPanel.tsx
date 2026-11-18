import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import AnalyticsService from '@/services/analytics/analyticsService';
import {
  ALL_OPTION,
  matchingOptions,
  toChecked,
  toSelected,
  toggleOption,
} from './filterSelection';

export type FilterGroup = {
  // Also the key of the group's values in the selection
  id: string;
  label: string;
  // The first checkbox, which stands for no filter, e.g. "All ratings"
  allLabel: string;
  options: { value: string; label: string }[];
};

/** The chosen values of each filter group, by its id. None chosen means "All". */
export type FilterSelection = Record<string, string[]>;

type Props = {
  // Keeps element ids unique when the panel is shown in several tabs
  idPrefix: string;
  // The name the filters are tracked under
  filterType: string;
  groups: FilterGroup[];
  applied: FilterSelection;
  onApply: (selection: FilterSelection) => void;
};

// A long list (every care provider, say) is narrowed by its search box
// rather than drawn in full
const MAX_OPTIONS_SHOWN = 100;

type GroupProps = {
  idBase: string;
  group: FilterGroup;
  checked: string[];
  onChange: (checked: string[]) => void;
};

const FilterPanelGroup: React.FC<GroupProps> = ({
  idBase,
  group,
  checked,
  onChange,
}) => {
  const [search, setSearch] = useState('');
  // In a list too long to draw in full, the options ticked when the panel
  // opened come first so they can be seen and unticked without searching
  const [tickedOnOpen] = useState(checked);
  const isLong = group.options.length > MAX_OPTIONS_SHOWN;
  const matches = matchingOptions(
    [
      { value: ALL_OPTION, label: group.allLabel },
      ...(isLong
        ? [
            ...group.options.filter((o) => tickedOnOpen.includes(o.value)),
            ...group.options.filter((o) => !tickedOnOpen.includes(o.value)),
          ]
        : group.options),
    ],
    search
  );
  const shown = matches.slice(0, MAX_OPTIONS_SHOWN);

  return (
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
        {group.label}
      </legend>
      {/* Indented with the options below, as in the service's other filters */}
      <div className="app-c-option-select__filter">
        <label
          htmlFor={`${idBase}-search`}
          className="govuk-label govuk-visually-hidden"
        >
          Search {group.label.toLowerCase()} options
        </label>
        <input
          id={`${idBase}-search`}
          className="app-c-option-select__filter-input govuk-input"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="app-c-option-select__container">
        {/* The padding leaves room for a checkbox's hover and focus ring,
            which the scrolling container would otherwise cut off */}
        <div className="app-c-option-select__container-inner govuk-checkboxes govuk-checkboxes--small">
          {shown.map((option) => (
            <div className="govuk-checkboxes__item" key={option.value}>
              <input
                className="govuk-checkboxes__input"
                id={`${idBase}-${option.value}`}
                type="checkbox"
                value={option.value}
                checked={checked.includes(option.value)}
                onChange={(event) =>
                  onChange(
                    toggleOption(checked, option.value, event.target.checked)
                  )
                }
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor={`${idBase}-${option.value}`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div role="status">
        {matches.length === 0 && (
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            No options match your search
          </p>
        )}
        {matches.length > shown.length && (
          <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">
            Showing the first {shown.length} of{' '}
            {matches.length.toLocaleString('en-GB')} options. Search to find
            more.
          </p>
        )}
      </div>
    </fieldset>
  );
};

type ContentProps = Pick<Props, 'idPrefix' | 'groups' | 'applied'> & {
  onApply: (selection: FilterSelection) => void;
  onClear: () => void;
};

// Mounted only while the panel is open, so the boxes always start from the
// applied filters and changes that were not applied are discarded on closing
const FilterPanelContent: React.FC<ContentProps> = ({
  idPrefix,
  groups,
  applied,
  onApply,
  onClear,
}) => {
  const [checked, setChecked] = useState<FilterSelection>(() =>
    Object.fromEntries(
      groups.map((group) => [group.id, toChecked(applied[group.id])])
    )
  );

  return (
    <div id={`${idPrefix}-content`} className="dhsc-filter--content">
      <div className="govuk-grid-row">
        {groups.map((group) => (
          <div
            key={group.id}
            // Up to three filters are each a third of the panel, the width of
            // the service's other filters; more share the row as quarters
            className={`govuk-grid-column-${groups.length > 3 ? 'one-quarter' : 'one-third'} dhsc-filter--section-spacer-for-mobile`}
          >
            <FilterPanelGroup
              idBase={`${idPrefix}-${group.id}`}
              group={group}
              checked={checked[group.id]}
              onChange={(groupChecked) =>
                setChecked({ ...checked, [group.id]: groupChecked })
              }
            />
          </div>
        ))}
      </div>
      <div className="govuk-button-group govuk-!-margin-top-4">
        <button
          type="button"
          className="govuk-button"
          onClick={() =>
            onApply(
              Object.fromEntries(
                groups.map((group) => [
                  group.id,
                  toSelected(checked[group.id], group.options),
                ])
              )
            )
          }
        >
          Apply
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={onClear}
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

/**
 * Several checkbox filters in one panel, opened by a "Show filters" button and
 * applied or cleared together. Each filter has an "All" option and a search
 * box for its options.
 */
const FilterPanel: React.FC<Props> = ({
  idPrefix,
  filterType,
  groups,
  applied,
  onApply,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const toggleButton = useRef<HTMLButtonElement>(null);

  // Applying or clearing closes the panel, taking the pressed button with it
  const close = () => {
    setShowFilters(false);
    toggleButton.current?.focus();
  };

  const apply = (selection: FilterSelection) => {
    AnalyticsService.trackFilterApply(
      Object.values(selection).flat(),
      filterType
    );
    onApply(selection);
    close();
  };

  const clear = () => {
    AnalyticsService.trackFilterClear(filterType);
    onApply(Object.fromEntries(groups.map((group) => [group.id, []])));
    close();
  };

  return (
    <div>
      <div className="dhsc-filter--action">
        <button
          ref={toggleButton}
          id={`${idPrefix}-button`}
          className={`govuk-button ${showFilters ? 'dhsc-filter--open' : 'dhsc-filter--closed'}`}
          type="button"
          aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="dhsc-filter--button-content">
            {showFilters ? 'Hide' : 'Show'} filters
          </span>
          <FontAwesomeIcon
            className="govuk-!-margin-left-2"
            icon={showFilters ? faMinus : faPlus}
            aria-hidden="true"
          />
        </button>
      </div>
      {showFilters && (
        <FilterPanelContent
          idPrefix={idPrefix}
          groups={groups}
          applied={applied}
          onApply={apply}
          onClear={clear}
        />
      )}
    </div>
  );
};

export default FilterPanel;
