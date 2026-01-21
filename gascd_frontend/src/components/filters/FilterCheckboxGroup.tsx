import React, { useEffect, useState } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import FilterBox from './FilterBox';
import { filter_helptext } from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/helptext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

type Props = {
  filterType: string;
  filterLabel: string;
  updateMethod: () => void;
};

const FilterCheckboxGroup: React.FC<Props> = ({
  filterType,
  filterLabel,
  updateMethod,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showActiveFilters, setShowActiveFilters] = React.useState(false);
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<TotalBedsFilters[]>(
    []
  );
  const [searchedFilters, setSearchedFilters] = useState<TotalBedsFilters[]>(
    []
  );
  const [displayFilters, setDisplayFilters] = useState<string[] | null>(null);

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');
      setFilters(filters);
      setSearchedFilters(filters);

      const storedData = localStorage.getItem(filterType);
      if (storedData && storedData !== '[]') {
        const parsedData: TotalBedsFilters[] = JSON.parse(storedData);
        setSelectedFilters(parsedData);
        setDisplayFilters(parsedData.map((filter) => filter.filter_bedtype));
        filters.forEach((filter) => {
          if (
            parsedData.some(
              (stored) => stored.filter_bedtype === filter.filter_bedtype
            )
          ) {
            filter.checked = true;
          }
        });
        setShowActiveFilters(true);
      } else {
        setSelectedFilters(filters);
      }
    };
    getFilters();
  }, []);

  const handleCheckboxChange = (metric_id: string, checked: boolean) => {
    const newFilters = [...filters];
    let newItem = newFilters.findIndex((item) => item.metric_id === metric_id);
    newFilters[newItem].checked = checked;
    setFilters(newFilters);

    setSelectedFilters(
      filters
        .filter((filter) => filter.checked)
        .map((filter) => ({
          metric_id: filter.metric_id,
          filter_bedtype: filter.filter_bedtype,
        }))
    );
  };

  const handleSubmit = () => {
    localStorage.setItem(filterType, JSON.stringify(selectedFilters));
    setShowFilters(false);
    setShowActiveFilters(true);
    setDisplayFilters(
      selectedFilters?.map((filter) => filter.filter_bedtype) ?? null
    );
    updateMethod();
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
    setShowFilters(false);
    setShowActiveFilters(false);
    setDisplayFilters(null);
    filters.map((filter) => (filter.checked = false));
    updateMethod();
  };

  const clearFilter = (filterName: string) => {
    const updatedSelectedFilters = selectedFilters.filter(
      (filter) => filter.filter_bedtype !== filterName
    );
    filters.map((filter) =>
      filter.filter_bedtype === filterName
        ? (filter.checked = false)
        : (filter.checked = filter.checked)
    );
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

  return (
    <div className="govuk-!-padding-bottom-4 govuk-!-padding-top-4">
      <div className="dhsc-filter--action">
        <button
          id={`${filterType}-button`}
          className="govuk-button"
          type="button"
          aria-expanded={`${showFilters ? true : false}`}
          aria-label={`${showFilters ? 'Hide' : 'Show'} ${filterLabel} filters`}
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
          <FontAwesomeIcon
            className="govuk-!-margin-left-2"
            icon={showFilters ? faMinus : faPlus}
            aria-hidden="true"
          />
        </button>
      </div>
      {showFilters && (
        <FilterBox>
          {filters.length === 0 && (
            <p className="govuk-body govuk-!-padding-left-3">
              Loading filters...
            </p>
          )}
          {filters.length > 0 && (
            <>
              <div
                id="checkboxes-search"
                className="app-c-option-select__container js-options-container"
              >
                <label
                  htmlFor="input-bedtype-checkboxes"
                  className="govuk-label govuk-visually-hidden"
                >
                  Bed type
                </label>
                <input
                  id="input-bedtype-checkboxes"
                  className="app-c-option-select__filter-input govuk-input"
                  type="text"
                  onKeyUp={handleSearch}
                />
              </div>
              <div
                role="group"
                aria-labelledby="option-select-title-status-checkboxes"
                className="app-c-option-select__container js-options-container"
                tabIndex={-1}
              >
                <div className="app-c-option-select__container-inner js-auto-height-inner">
                  <div className="gem-c-checkboxes govuk-form-group govuk-checkboxes--small">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m gem-c-checkboxes__legend--hidden">
                        Bed type
                      </legend>
                      <ul className="govuk-checkboxes gem-c-checkboxes__list">
                        {searchedFilters.map((filter: any, index) => (
                          <li className="govuk-checkboxes__item" key={index}>
                            <input
                              className="govuk-checkboxes__input"
                              id={filter.metric_id}
                              name="Table filter"
                              type="checkbox"
                              value={filter.metric_id}
                              defaultChecked={filter.checked || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  e.target.value,
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              className="govuk-label govuk-checkboxes__label"
                              htmlFor={filter.metric_id}
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
                    <button
                      className="govuk-button govuk-button--secondary"
                      onClick={() => clearFilters()}
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
                  Bed type: {filterName}
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
