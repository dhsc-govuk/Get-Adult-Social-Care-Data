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
  // An optional second select shown in the same panel, applied and cleared by
  // the same buttons. Used where a figure is broken down two ways, e.g. by
  // duration of care and then by support setting.
  secondaryFilterType?: string;
  secondaryFilterLabel?: string;
  secondaryFilters?: Object;
};

const FilterRadioGroup: React.FC<Props> = ({
  filterType,
  filterLabel,
  filters,
  updateMethod,
  secondaryFilterType,
  secondaryFilterLabel,
  secondaryFilters,
}) => {
  const hasSecondary = Boolean(secondaryFilterType && secondaryFilters);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showActiveFilters, setShowActiveFilters] = React.useState(false);
  const [componentFilters, setComponentFilters] = useState<Filters[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filters>();
  const [displayFilter, setDisplayFilter] = useState<string | null>(null);
  const [secondaryComponentFilters, setSecondaryComponentFilters] = useState<
    Filters[]
  >([]);
  const [secondarySelectedFilter, setSecondarySelectedFilter] =
    useState<Filters>();

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

    if (hasSecondary) {
      const localSecondary: Filters[] = Object.entries(
        secondaryFilters as Object
      ).map(([key, value]) => ({
        metric_id: key,
        filter_bedtype: value as string,
        checked: false,
      }));
      const storedSecondary = localStorage.getItem(
        secondaryFilterType as string
      );
      if (storedSecondary) {
        const parsed = JSON.parse(storedSecondary);
        setSecondarySelectedFilter({
          metric_id: parsed.metric_id,
          filter_bedtype: parsed.filter_bedtype,
        });
      } else {
        setSecondarySelectedFilter(localSecondary[0]);
      }
      setSecondaryComponentFilters(localSecondary);
    }
  };

  const handleSecondaryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const metric_id = event.target.value;
    setSecondarySelectedFilter({
      metric_id,
      filter_bedtype:
        secondaryComponentFilters.find(
          (filter) => filter.metric_id === metric_id
        )?.filter_bedtype || '',
    });
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
    if (hasSecondary) {
      localStorage.setItem(
        secondaryFilterType as string,
        JSON.stringify(secondarySelectedFilter)
      );
    }
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
    if (hasSecondary) {
      localStorage.removeItem(secondaryFilterType as string);
      setSecondarySelectedFilter(secondaryComponentFilters[0]);
    }
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
        metric_id: 'elss_all_types_of_adult_social_care_all_ages',
        filter_bedtype: 'All types of adult social care',
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
              {hasSecondary && (
                <div className="govuk-!-margin-top-4">
                  <h4
                    className="govuk-label govuk-label--s govuk-label-wrapper"
                    id={`${secondaryFilterType}-label`}
                  >
                    {secondaryFilterLabel}
                  </h4>
                  <select
                    aria-labelledby={`${secondaryFilterType}-label`}
                    className="govuk-select"
                    value={secondarySelectedFilter?.metric_id ?? ''}
                    onChange={(e) => handleSecondaryChange(e)}
                  >
                    {secondaryComponentFilters.map((filter: any, index) => (
                      <option key={index} value={filter.metric_id}>
                        {filter.filter_bedtype}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
