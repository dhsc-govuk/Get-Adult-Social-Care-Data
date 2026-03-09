import React, { useEffect, useState } from 'react';
import { Filters } from '@/data/interfaces/Filters';
import FilterBox from './FilterBox';
import { filter_helptext } from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/helptext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import AnalyticsService from '@/services/analytics/analyticsService';

type Props = {
  filterType: string;
  filterLabel: string;
  filters: Object;
  updateMethod: () => void;
};

const FilterCheckboxGroup: React.FC<Props> = ({
  filterType,
  filterLabel,
  filters,
  updateMethod,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showActiveFilters, setShowActiveFilters] = React.useState(false);
  const [componentFilters, setComponentFilters] = useState<Filters[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Filters[]>([]);
  const [searchedFilters, setSearchedFilters] = useState<Filters[]>([]);
  const [displayFilters, setDisplayFilters] = useState<string[] | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  useEffect(() => {
    let localFilters: Filters[] = Object.entries(filters).map(
      ([key, value]) => {
        return { metric_id: key, filter_bedtype: value, checked: false };
      }
    );
    const storedData = localStorage.getItem(filterType);
    if (storedData && storedData !== '[]') {
      const parsedData: Filters[] = JSON.parse(storedData);
      localFilters.forEach((filter) => {
        if (
          parsedData.some((stored) => stored.metric_id === filter.metric_id)
        ) {
          filter.checked = true;
        }
      });
      setDisplayFilters(parsedData.map((filter) => filter.filter_bedtype));
      setShowActiveFilters(true);
    }
    setComponentFilters(localFilters);
    setSearchedFilters(localFilters);
  }, []);

  useEffect(() => {
    setSelectedFilters(componentFilters.filter((filter) => filter.checked));
  }, [componentFilters]);

  useEffect(() => {
    setShowClearAll(selectedFilters.length > 0);
  }, [selectedFilters]);

  const handleShowHideToggle = (showFilters: boolean) => {
    setSearchedFilters(componentFilters);
    setShowFilters(showFilters);
  };

  const handleCheckboxChange = (metric_id: string, checked: boolean) => {
    const newFilters: Filters[] = [...componentFilters];
    let newItem = newFilters.findIndex((item) => item.metric_id === metric_id);
    newFilters[newItem].checked = checked;
    setComponentFilters(newFilters);
    setSelectedFilters(
      newFilters
        .filter((filter) => filter.checked)
        .map((filter) => ({
          checked: filter.checked,
          metric_id: filter.metric_id,
          filter_bedtype: filter.filter_bedtype,
        }))
    );
    handleSearch();
  };

  const handleSubmit = () => {
    if (selectedFilters.length === 0) {
      clearFilters();
      return;
    }
    localStorage.setItem(filterType, JSON.stringify(selectedFilters));
    setShowFilters(false);
    setShowActiveFilters(true);
    setDisplayFilters(
      selectedFilters?.map((filter) => filter.filter_bedtype) ?? null
    );
    resetGroup();
    AnalyticsService.trackFilterApply(
      selectedFilters.map((filter) => filter.metric_id),
      filterType
    );
  };

  const handleSearch = (): void => {
    const searchBox = document.getElementById(
      'input-filter-search'
    ) as HTMLInputElement | null;
    if (!searchBox) return;
    const searchTerm = searchBox.value.toLowerCase() ?? '';
    const searchedFilters = componentFilters.filter((filter) =>
      filter.filter_bedtype.toLowerCase().includes(searchTerm)
    );
    setSearchedFilters(searchedFilters);
  };

  const clearFilters = () => {
    AnalyticsService.trackFilterClear(filterType);
    localStorage.removeItem(filterType);
    setShowActiveFilters(false);
    setDisplayFilters(null);
    setSelectedFilters([]);
    componentFilters.map((filter) => (filter.checked = false));
    resetGroup();
  };

  const clearFilter = (filterName: string) => {
    const updatedSelectedFilters = selectedFilters.filter(
      (filter) => filter.filter_bedtype !== filterName
    );
    componentFilters.map((filter) =>
      filter.filter_bedtype === filterName
        ? (filter.checked = false)
        : (filter.checked = filter.checked)
    );
    const metricId = componentFilters.find(
      (filter) => filter.filter_bedtype === filterName
    )?.metric_id;
    if (metricId) {
      AnalyticsService.trackFilterRemove(metricId, filterType);
    }
    if (updatedSelectedFilters.length === 0) {
      clearFilters();
    } else {
      setSelectedFilters(updatedSelectedFilters);
      localStorage.setItem(filterType, JSON.stringify(updatedSelectedFilters));
      setDisplayFilters(
        updatedSelectedFilters.map((filter) => filter.filter_bedtype)
      );
      updateMethod();
    }
  };

  const resetGroup = () => {
    setSearchedFilters(componentFilters);
    setShowFilters(false);
    updateMethod();
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
          <span
            id="dhsc-filter--button-content1"
            className="dhsc-filter--button-content"
          >
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
                {selectedFilters.length > 0 && (
                  <p className="app-c-option-select__selected-counter js-selected-counter searchable-filters-heading">
                    {selectedFilters.length} selected
                  </p>
                )}
              </div>
              <div
                id="radios-search"
                className="app-c-option-select__filter"
                hidden
                style={{ display: 'block' }}
              >
                <div
                  id="checkboxes-search"
                  className="app-c-option-select__container js-options-container"
                >
                  <label
                    htmlFor="input-filter-search"
                    className="govuk-label govuk-visually-hidden"
                  >
                    {filterLabel} search
                  </label>
                  <input
                    id="input-filter-search"
                    className="app-c-option-select__filter-input govuk-input"
                    type="text"
                    onKeyUp={handleSearch}
                  />
                </div>
              </div>
              <div
                role="group"
                className="app-c-option-select__container js-options-container"
                tabIndex={-1}
                style={{ height: 255.333 + 'px' }}
              >
                <div className="app-c-option-select__container-inner js-auto-height-inner">
                  <div className="gem-c-checkboxes govuk-form-group govuk-checkboxes--small">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m gem-c-checkboxes__legend--hidden">
                        {filterLabel}
                      </legend>
                      <ul className="govuk-checkboxes gem-c-checkboxes__list">
                        {searchedFilters.map((filter: any, index) => (
                          <li className="govuk-checkboxes__item" key={index}>
                            <input
                              className="govuk-checkboxes__input"
                              id={filterType + filter.metric_id}
                              name="Table filter"
                              type="checkbox"
                              value={filter.metric_id}
                              checked={filter.checked || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  e.target.value,
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              className="govuk-label govuk-checkboxes__label"
                              htmlFor={filterType + filter.metric_id}
                            >
                              {filter.filter_bedtype}
                            </label>
                            {filter_helptext[filter.metric_id] && (
                              <div className="govuk-hint govuk-checkboxes__hint">
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
                    {showClearAll && (
                      <button
                        className="govuk-button govuk-button--secondary"
                        onClick={() => clearFilters()}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </FilterBox>
      )}
      {displayFilters && showActiveFilters && (
        <div className="app-c-filter-summary">
          <h5 className="app-c-filter-summary__heading">Active filters</h5>
          <ul className="app-c-filter-summary__remove-filters">
            {displayFilters.map((filterName, index) => (
              <li key={index}>
                <button
                  className="app-c-filter-summary__remove-filter govuk-link govuk-body-m govuk-!-margin-bottom-0"
                  onClick={() => clearFilter(filterName)}
                >
                  <span className="govuk-visually-hidden">Remove filter</span>
                  {filterLabel}: {filterName}
                </button>
              </li>
            ))}
          </ul>
          <div>
            <button
              className="govuk-button govuk-button--inverse govuk-button--secondary"
              onClick={() => clearFilters()}
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterCheckboxGroup;
