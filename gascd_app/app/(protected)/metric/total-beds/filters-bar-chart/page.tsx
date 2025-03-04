'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import Layout from '@/components/common/layout/Layout';

const TotalBedsFiltersPage: React.FC = () => {
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');

      const storedMetric = localStorage.getItem('bar-chart-metric');

      if (storedMetric) {
        try {
          const parsedMetric: { metric_id: string; filter_bedtype: string } =
            JSON.parse(storedMetric);

          const updatedFilters = filters.map((filter) => ({
            ...filter,
            checked: filter.metric_id === parsedMetric.metric_id,
          }));

          setFilters(updatedFilters);
        } catch (error) {
          setFilters(filters);
        }
      } else {
        setFilters(filters);
      }
    };

    getFilters();
  }, []);

  const handleRadioChange = (selectedIndex: number) => {
    const updatedFilters = filters.map((filter, index) => ({
      ...filter,
      checked: index === selectedIndex,
    }));

    setFilters(updatedFilters);

    const selectedFilter = updatedFilters.find((filter) => filter.checked);
    if (selectedFilter) {
      localStorage.setItem('bar-chart-metric', JSON.stringify(selectedFilter));
    }
  };

  const handleSubmit = () => {
    const selectedFilter = filters.find((filter) => filter.checked);
    if (selectedFilter) {
      localStorage.setItem('bar-chart-metric', JSON.stringify(selectedFilter));
    }
  };

  return (
    <Layout
      showLoginInformation={true}
      currentPage={'/metric/total-beds/filters'}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-m">
            Total beds per 100,000 population
          </span>
          <h1 className="govuk-heading-l">Edit chart filter</h1>
          <p className="govuk-body">
            Select filters to refine the data displayed.
          </p>
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset" aria-describedby="metric-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h1 className="govuk-fieldset__heading">Filters</h1>
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                {filters.map((filter, index) => (
                  <div key={index} className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id={`metric-${index}`}
                      name="metric"
                      type="radio"
                      value={filter.metric_id}
                      checked={filter.checked}
                      onChange={() => handleRadioChange(index)}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor={`metric-${index}`}
                    >
                      {filter.filter_bedtype}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <Link href="/metric/total-beds#chart" onClick={handleSubmit}>
            <button type="button" className="govuk-button">
              Submit
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TotalBedsFiltersPage;
