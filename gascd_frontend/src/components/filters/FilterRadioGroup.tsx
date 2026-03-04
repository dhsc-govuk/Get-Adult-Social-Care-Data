import React, { useEffect, useState } from 'react';
import { Filters } from '@/data/interfaces/Filters';
import FilterBox from './FilterBox';
import { filter_helptext } from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/helptext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { set } from 'better-auth';
import AnalyticsService from '@/services/analytics/analyticsService';

type Props = {
  filterType: string;
  filterLabel: string;
  filters: Object;
  updateMethod: () => void;
};

const FilterRadioGroup: React.FC<Props> = ({
  filterType,
  filterLabel,
  filters,
  updateMethod,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showActiveFilters, setShowActiveFilters] = React.useState(false);
  const [componentFilters, setComponentFilters] = useState<Filters[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filters>();
  const [searchedFilters, setSearchedFilters] = useState<Filters[]>([]);
  const [displayFilter, setDisplayFilter] = useState<string | null>(null);

  useEffect(() => {
    setLocalFilters();
    setSearchedFilters(componentFilters);
  }, []);

  const setLocalFilters = () => {
    let localFilters: Filters[] = Object.entries(filters).map(
      ([key, value]) => {
        return { metric_id: key, filter_label: value, checked: false };
      }
    );

    const storedData = localStorage.getItem(filterType);
    if (storedData) {
      let filterFromStorage: Filters = {
        metric_id: JSON.parse(storedData).metric_id,
        filter_label: JSON.parse(storedData).filter_label,
      };
      setSelectedFilter(filterFromStorage);
      setDisplayFilter(JSON.parse(storedData).filter_label);
      setShowActiveFilters(true);
    } else {
      setDefaultFilter();
    }
    setComponentFilters(localFilters);
  };

  const handleShowHideToggle = (showFilters: boolean) => {
    setSearchedFilters(componentFilters);
    setShowFilters(showFilters);
  };

  const handleChange = (metric_id: string, filter_label: string) => {
    let newFilter: Filters = {
      metric_id: metric_id,
      filter_label: filter_label,
    };
    setSelectedFilter(newFilter);
  };

  const handleSubmit = () => {
    localStorage.setItem(filterType, JSON.stringify(selectedFilter));
    setShowFilters(false);
    setShowActiveFilters(true);
    setDisplayFilter(selectedFilter?.filter_label ?? null);
    updateMethod();
    AnalyticsService.trackFilterApply(
      [selectedFilter?.filter_label ?? ''],
      filterType
    );
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const searchedFilters = componentFilters.filter((filter) =>
      filter.filter_label.toLowerCase().includes(searchTerm)
    );
    setSearchedFilters(searchedFilters);
  };

  const removeFilter = (filter_name: string) => {
    AnalyticsService.trackFilterRemove(filterType, filter_name);
    _clearFilters();
  };

  const clearAllFilters = () => {
    AnalyticsService.trackFilterClear(filterType);
    _clearFilters();
  };

  const _clearFilters = () => {
    localStorage.removeItem(filterType);
    setDefaultFilter();
    setShowFilters(false);
    setShowActiveFilters(false);
    setDisplayFilter(null);
    updateMethod();
    AnalyticsService.trackFilterRemove(
      selectedFilter?.filter_label ?? '',
      filterType
    );
  };

  const setDefaultFilter = () => {
    if (filterType === 'numbers-table-metrics') {
      setSelectedFilter({
        metric_id: 'bedcount_per_hundred_thousand_adults_total',
        filter_label: 'All bed types',
      });
    }
  };

  return (
    <div className="govuk-!-padding-bottom-4 govuk-!-padding-top-4">
      <div className="dhsc-filter--action">
        <button
          id={`${filterType}-button`}
          className={`govuk-button ${showFilters ? 'dhsc-filter--open' : 'dhsc-filter--closed'}`}
          type="button"
          aria-expanded={`${showFilters ? true : false}`}
          aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
          onClick={
            showFilters
              ? () => handleShowHideToggle(false)
              : () => handleShowHideToggle(true)
          }
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
        <FilterBox>
          {componentFilters.length === 0 && (
            <p className="govuk-body govuk-!-padding-left-3">
              Loading filters...
            </p>
          )}
          {componentFilters.length > 0 && (
            <>
              <div className="js-container-heading">
                <h4 className="govuk-heading-s searchable-filters-heading">
                  {filterLabel}
                </h4>
              </div>
              <div
                id="radios-search"
                className="app-c-option-select__filter"
                hidden
                style={{ display: 'block' }}
              >
                <label
                  htmlFor="input-bedtype-radios"
                  className="govuk-label govuk-visually-hidden"
                >
                  {filterLabel} search
                </label>
                <input
                  id="input-bedtype-radios"
                  className="app-c-option-select__filter-input govuk-input"
                  type="text"
                  onKeyUp={handleSearch}
                />
              </div>
              <div
                role="group"
                className="app-c-option-select__container js-options-container"
                tabIndex={-1}
              >
                <div className="app-c-option-select__container-inner js-auto-height-inner">
                  <div className="govuk-radios govuk-form-group govuk-radios--small">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend gem-c-radios govuk-fieldset__legend--m govuk-visually-hidden">
                        {filterLabel}
                      </legend>
                      <ul className="govuk-radios__list gem-c-radios__list">
                        {searchedFilters.map((filter: any, index) => (
                          <li className="govuk-radios__item" key={index}>
                            <input
                              className="govuk-radios__input"
                              id={filterType + filter.metric_id}
                              name="Table filter"
                              type="radio"
                              value={filter.metric_id}
                              checked={
                                selectedFilter?.metric_id === filter.metric_id
                              }
                              onChange={() =>
                                handleChange(
                                  filter.metric_id,
                                  filter.filter_label
                                )
                              }
                            />
                            <label
                              className="govuk-label govuk-radios__label"
                              htmlFor={filterType + filter.metric_id}
                            >
                              {filter.filter_label}
                            </label>
                            {filter_helptext[filter.metric_id] && (
                              <div className="govuk-hint govuk-radios__hint">
                                {filter_helptext[filter.metric_id]}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </fieldset>
                  </div>
                </div>
              </div>
              <div className="govuk-grid-row govuk-!-margin-top-4">
                <div className="govuk-grid-column-full">
                  <div className="govuk-button-group">
                    <button
                      id={`${filterType}-submit-button`}
                      type="submit"
                      className="govuk-button"
                      onClick={() => handleSubmit()}
                    >
                      Apply
                    </button>
                    <button
                      className="govuk-button govuk-button--secondary"
                      onClick={() => clearAllFilters()}
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </FilterBox>
      )}
      {displayFilter && showActiveFilters && (
        <div className="app-c-filter-summary">
          <h5 className="app-c-filter-summary__heading">Active filters</h5>
          <div className="app-c-filter-summary__remove-filters">
            <button
              className="app-c-filter-summary__remove-filter govuk-link govuk-body-m"
              onClick={() => removeFilter(displayFilter)}
            >
              <span className="govuk-visually-hidden">Remove filter</span>
              {filterLabel}: {displayFilter}
            </button>
          </div>
          <div>
            <button
              className="govuk-button govuk-button--secondary govuk-button--inverse"
              onClick={() => clearAllFilters()}
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterRadioGroup;
