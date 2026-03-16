import React, { useEffect, useState } from 'react';
import { Filters } from '@/data/interfaces/Filters';
import FilterBox from './FilterBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
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
  const [displayFilter, setDisplayFilter] = useState<string | null>(null);

  useEffect(() => {
    setLocalFilters();
  }, []);

  const setLocalFilters = () => {
    let localFilters: Filters[] = Object.entries(filters).map(
      ([key, value]) => {
        return { metric_id: key, filter_bedtype: value, checked: false };
      }
    );

    const storedData = localStorage.getItem(filterType);
    if (storedData) {
      let filterFromStorage: Filters = {
        metric_id: JSON.parse(storedData).metric_id,
        filter_bedtype: JSON.parse(storedData).filter_bedtype,
      };
      setSelectedFilter(filterFromStorage);
      setDisplayFilter(JSON.parse(storedData).filter_bedtype);
      setShowActiveFilters(true);
    } else {
      setDefaultFilter();
    }
    setComponentFilters(localFilters);
  };

  const handleShowHideToggle = (showFilters: boolean) => {
    setShowFilters(showFilters);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const metric_id = event.target.value;
    const filter_bedtype =
      componentFilters.find((filter) => filter.metric_id === metric_id)
        ?.filter_bedtype || '';

    let newFilter: Filters = {
      metric_id: metric_id,
      filter_bedtype: filter_bedtype,
    };
    setSelectedFilter(newFilter);
  };

  const handleSubmit = () => {
    localStorage.setItem(filterType, JSON.stringify(selectedFilter));
    setShowFilters(false);
    setShowActiveFilters(true);
    setDisplayFilter(selectedFilter?.filter_bedtype ?? null);
    updateMethod();
    AnalyticsService.trackFilterApply(
      [selectedFilter?.metric_id ?? ''],
      filterType
    );
  };

  const clearFilters = () => {
    localStorage.removeItem(filterType);
    setDefaultFilter();
    setShowFilters(false);
    setShowActiveFilters(false);
    setDisplayFilter(null);
    updateMethod();
    AnalyticsService.trackFilterRemove(
      selectedFilter?.metric_id ?? '',
      filterType
    );
  };

  const setDefaultFilter = () => {
    if (filterType === 'long-term-funding-support-type') {
      setSelectedFilter({
        metric_id: 'elss_all_types_of_care_home_all_ages',
        filter_bedtype: 'All types of care home',
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
            <div className="govuk-form-group govuk-!-padding-left-4">
              <h4
                className="govuk-label govuk-label--s govuk-label-wrapper"
                id={`${filterType}-label`}
              >
                {filterLabel}
              </h4>
              <select
                aria-labelledby={`${filterType}-label`}
                className="govuk-select"
                onChange={(e) => handleChange(e)}
              >
                {componentFilters.map((filter: any, index) => (
                  <option
                    key={index}
                    value={filter.metric_id}
                    selected={selectedFilter?.metric_id === filter.metric_id}
                  >
                    {filter.filter_bedtype}
                  </option>
                ))}
              </select>
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
            </div>
          )}
        </FilterBox>
      )}
      {displayFilter && showActiveFilters && (
        <div className="app-c-filter-summary">
          <h5 className="app-c-filter-summary__heading">Active filters</h5>
          <div className="app-c-filter-summary__remove-filters">
            <button
              className="app-c-filter-summary__remove-filter govuk-link govuk-body-m"
              onClick={() => clearFilters()}
            >
              <span className="govuk-visually-hidden">Remove filter</span>
              {filterLabel}: {displayFilter}
            </button>
          </div>
          <div>
            <button
              className="govuk-button govuk-button--secondary govuk-button--inverse"
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
