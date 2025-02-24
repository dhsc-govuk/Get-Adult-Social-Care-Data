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
      setFilters(filters);
    };
    getFilters();
  }, []);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newFilters = [...filters];
    newFilters[index].checked = checked;
    setFilters(newFilters);
  };

  const selectedFilters = filters
    .filter((filter) => filter.checked)
    .map((filter) => ({
      metric_id: filter.metric_id,
      filter_bedtype: filter.filter_bedtype,
    }));

  const encodedSelectedFilters = encodeURIComponent(
    JSON.stringify(selectedFilters)
  );

  return (
    <Layout
      showLoginInformation={false}
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
            <fieldset className="govuk-fieldset" aria-describedby="waste-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h1 className="govuk-fieldset__heading">Filters</h1>
              </legend>
              <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                {filters.map((filter, index) => (
                  <div key={index} className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id={`waste-${index}`}
                      name="waste"
                      type="checkbox"
                      value={filter.metric_id}
                      checked={filter.checked}
                      onChange={(e) =>
                        handleCheckboxChange(index, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={`waste-${index}`}
                    >
                      {filter.filter_bedtype}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <Link
            href={{
              pathname: '/metric/total-beds',
              query: { filters: encodedSelectedFilters },
            }}
            className="govuk-button"
          >
            Next
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TotalBedsFiltersPage;
