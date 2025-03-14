import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import React from 'react';

type Props = {
  filters: TotalBedsFilters[];
  onChange: (index: number) => void;
};

const FiltersList: React.FC<Props> = ({ filters, onChange }) => {
  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset" aria-describedby="metric-hint">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h1 className="govuk-fieldset__heading">Filters</h1>
        </legend>
        {filters.length > 0 ? (
          <div className="govuk-radios" data-module="govuk-radios">
            {filters.map((filter, index) => (
              <div key={index} className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id={`filter-${index}`}
                  name="chart-metric"
                  type="radio"
                  value={filter.metric_id}
                  checked={filter.checked}
                  onChange={() => onChange(index)}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor={`filter-${index}`}
                >
                  {filter.filter_bedtype}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="govuk-body">Loading filters...</p>
        )}
      </fieldset>
    </div>
  );
};

export default FiltersList;
