import React, { useEffect, useState } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import FilterBox from './FilterBox';
import { filter_helptext } from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/helptext';

type Props = {
  filterType: string;
  filterLabel: string;
};

const FilterRadioGroup: React.FC<Props> = ({ filterType, filterLabel }) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showActiveFilters, setShowActiveFilters] = React.useState(false);
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<TotalBedsFilters>();
  const [searchedFilters, setSearchedFilters] = useState<TotalBedsFilters[]>(
    []
  );

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');
      setFilters(filters);
      setSearchedFilters(filters);

      const storedData = localStorage.getItem(filterType);
      if (storedData) {
        setSelectedFilter(JSON.parse(storedData));
      } else {
        setDefaultFilter();
      }
    };
    getFilters();
  }, []);

  const handleChange = (filter: TotalBedsFilters) => {
    setSelectedFilter(filter);
  };

  const handleSubmit = () => {
    localStorage.setItem(filterType, JSON.stringify(selectedFilter));
    setShowFilters(false);
    setShowActiveFilters(true);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const searchedFilters = filters.filter((filter) =>
      filter.filter_bedtype.toLowerCase().includes(searchTerm)
    );
    setSearchedFilters(searchedFilters);
  };

  const clearFilters = () => {
    localStorage.removeItem(filterType);
    setDefaultFilter();
    setShowFilters(false);
    setShowActiveFilters(false);
  };

  const setDefaultFilter = () => {
    if (filterType === 'numbers-table-metrics') {
      setSelectedFilter({
        metric_id: 'bedcount_per_100000_adults_total',
        filter_bedtype: 'All bed types',
      });
    }
  };

  return (
    <div className="govuk-!-padding-bottom-4 govuk-!-padding-top-4">
      <div id="dhsc-filter--action1" className="dhsc-filter--action">
        <button
          id="dhsc-filter--button1"
          className="govuk-button"
          type="button"
          aria-expanded={`${showFilters ? true : false}`}
          aria-controls="dhsc-filter--content1"
          onClick={
            showFilters
              ? () => setShowFilters(false)
              : () => setShowFilters(true)
          }
        >
          <span
            id="dhsc-filter--button-content1"
            className="dhsc-filter--button-content"
          >
            {showFilters ? 'Hide' : 'Show'} filters
          </span>
          <i
            id="dhsc-filter--icon1"
            className={`fa ${showFilters ? 'fa-plus' : 'fa-minus'}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {showFilters && (
        <div>
          <FilterBox filterLabel={filterLabel}>
            <div id="radios-search" className="app-c-option-select__filter">
              <label
                htmlFor="input-bedtype-radios"
                className="govuk-label govuk-visually-hidden"
              >
                {filterLabel}
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
              aria-labelledby="option-select-title-status-radios"
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
                      {filters &&
                        searchedFilters.map((filter: any, index) => (
                          <li className="govuk-radios__item" key={index}>
                            <input
                              className="govuk-radios__input"
                              id={filter.metric_id}
                              name="Table filter"
                              type="radio"
                              value={filter.metric_id}
                              defaultChecked={
                                selectedFilter?.metric_id === filter.metric_id
                              }
                              onChange={() => handleChange(filter)}
                            />
                            <label
                              className="govuk-label govuk-radios__label"
                              htmlFor={filter.metric_id}
                            >
                              {filter.filter_bedtype}
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
                    type="submit"
                    className="govuk-button"
                    onClick={() => handleSubmit()}
                  >
                    Apply
                  </button>
                  <button
                    className="govuk-button govuk-button--secondary"
                    onClick={() => clearFilters()}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </FilterBox>
        </div>
      )}
      {selectedFilter && showActiveFilters && (
        <div className="app-c-filter-summary">
          <h5 className="app-c-filter-summary__heading">Active filters</h5>
          <ul className="app-c-filter-summary__remove-filters">
            <li>
              <button
                className="app-c-filter-summary__remove-filter govuk-link govuk-body-m govuk-!-margin-bottom-0"
                onClick={() => clearFilters()}
              >
                <span className="govuk-visually-hidden">Remove filter</span>
                {filterLabel}: {selectedFilter.filter_bedtype}
              </button>
            </li>
          </ul>
          <div>
            <button
              className="govuk-button govuk-button--secondary"
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

export default FilterRadioGroup;
