import React, { useEffect, useState } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import FilterBox from './FilterBox';
import { filter_helptext } from '../../../app/(protected)/topics/residential-care/provision-and-occupancy/helptext';
import { useRouter } from 'next/navigation';

type Props = {
  filterType: string;
  filterLabel: string;
};

const FilterCheckboxGroup: React.FC<Props> = ({ filterType, filterLabel }) => {
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
  const router = useRouter();

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');
      setFilters(filters);
      setSearchedFilters(filters);

      const storedData = localStorage.getItem(filterType);
      if (storedData) {
        setSelectedFilters(JSON.parse(storedData));
        setDisplayFilters(
          JSON.parse(storedData).map((filter: any) => filter.filter_bedtype)
        );
        setShowActiveFilters(true);
        const parsedData = JSON.parse(storedData);
        const preSelectedFilters = filters.map((filter) => ({
          ...filter,
          checked: parsedData.some(
            (item: TotalBedsFilters) => item.metric_id === filter.metric_id
          ),
        }));
        setFilters(preSelectedFilters);
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
    localStorage.setItem('type-table-metrics', JSON.stringify(selectedFilters));
    setShowFilters(false);
    setShowActiveFilters(true);
    setDisplayFilters(
      selectedFilters?.map((filter) => filter.filter_bedtype) ?? null
    );
    router.refresh();
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
    router.refresh();
  };

  const clearFilter = (filterName: string) => {
    const updatedSelectedFilters = selectedFilters.filter(
      (filter) => filter.filter_bedtype !== filterName
    );
    setSelectedFilters(updatedSelectedFilters);
    localStorage.setItem(filterType, JSON.stringify(updatedSelectedFilters));
    if (updatedSelectedFilters.length === 0) {
      setShowActiveFilters(false);
      setDisplayFilters(null);
    } else {
      setDisplayFilters(
        updatedSelectedFilters.map((filter) => filter.filter_bedtype)
      );
    }
    router.refresh();
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
        <FilterBox filterLabel={filterLabel}>
          {filters.length === 0 && (
            <p className="govuk-body">Loading filters...</p>
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
                  {filterLabel}
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
                        {filterLabel}
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
                  {filterLabel}: {filterName}
                </button>
              </li>
            ))}
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

export default FilterCheckboxGroup;
