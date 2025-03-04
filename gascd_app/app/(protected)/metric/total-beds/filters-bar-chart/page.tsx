'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import Layout from '@/components/common/layout/Layout';
import { useRouter } from 'next/navigation';

const TotalBedsFiltersPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);

  useEffect(() => {
    const getFilters = async () => {
      try {
        const fetchedFilters: TotalBedsFilters[] =
          await IndicatorFetchService.getFilters('');

        const storedMetric = localStorage.getItem('bar-chart-metric');

        if (storedMetric) {
          const parsedMetric = JSON.parse(storedMetric);

          const updatedFilters = fetchedFilters.map((filter) => ({
            ...filter,
            checked: filter.metric_id === parsedMetric.metric_id,
          }));

          setFilters(updatedFilters);
        } else {
          setFilters(fetchedFilters);
        }
      } catch (error) {
        console.error('Error loading filters:', error);
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
      <Link onClick={() => router.back()} className="govuk-back-link" href="">
        Back
      </Link>
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
                        onChange={() => handleRadioChange(index)}
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
          <Link href="/metric/total-beds#chart" onClick={handleSubmit}>
            <button type="button" className="govuk-button">
              Apply changes
            </button>
          </Link>
          <p className="govuk-body">
            <Link onClick={() => router.back()} className="govuk-link" href="">
              Cancel and go back
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TotalBedsFiltersPage;
