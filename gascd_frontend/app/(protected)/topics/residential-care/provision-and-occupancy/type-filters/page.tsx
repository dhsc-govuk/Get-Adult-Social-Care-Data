'use client';

import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { useRouter } from 'next/navigation';
import { helptext } from '../number-filters/page';

export default function ProvisionAndOccupancyTypeFiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<TotalBedsFilters[]>(
    []
  );

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');
      setFilters(filters);
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
    if (selectedFilters.length === 0) {
      setError(true);
      window.scrollTo({ top: 0 });
      return;
    }
    setError(false);
    localStorage.setItem('type-table-metrics', JSON.stringify(selectedFilters));
    router.push(
      '/topics/residential-care/provision-and-occupancy/data#table-2'
    );
  };

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care homes',
      url: '/topics/residential-care/subtopics',
    },
    {
      text: 'Care home beds and occupancy levels',
      url: '/topics/residential-care/provision-and-occupancy/data',
    },
  ];

  return (
    <Layout
      title="Edit filters - Get adult social care data"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="care-home-bed-types-filters"
      breadcrumbs={breadcrumbs}
    >
      {error && (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
          <div role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>
                  <a href="#bedType">Select at least one filter</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <div
        id="filter-list"
        className={
          error
            ? 'govuk-form-group--error govuk-!-padding-bottom-4'
            : 'govuk-form-group'
        }
      >
        <fieldset className="govuk-fieldset" aria-describedby="bedType-hint">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
            <span className="govuk-caption-xl">Care home bed types</span>
            <h1 className="govuk-fieldset__heading">Edit filters</h1>
          </legend>

          <div id="bedType-hint" className="govuk-hint govuk-!-margin-top-6">
            Select the filters to refine the data displayed.
          </div>
          <form>
            {error && (
              <p id="passport-issued-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> Select at
                least one filter
              </p>
            )}
            {filters &&
              filters.map((filter: any, index) => (
                <div className="govuk-checkboxes__item" key={index}>
                  <input
                    className="govuk-checkboxes__input"
                    id={filter.metric_id}
                    name="Table filter"
                    type="checkbox"
                    value={filter.metric_id}
                    onChange={(e) =>
                      handleCheckboxChange(e.target.value, e.target.checked)
                    }
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor={filter.metric_id}
                  >
                    {filter.filter_bedtype}
                  </label>
                  {helptext[filter.metric_id] && (
                    <div className="govuk-hint govuk-checkboxes__hint">
                      {helptext[filter.metric_id]}
                    </div>
                  )}
                </div>
              ))}
          </form>
        </fieldset>
      </div>
      <div
        className={
          error
            ? 'govuk-button-group govuk-!-padding-top-4'
            : 'govuk-button-group'
        }
      >
        <button
          type="button"
          className="govuk-button"
          onClick={() => handleSubmit()}
        >
          Apply changes
        </button>
        <Link
          href="/topics/residential-care/provision-and-occupancy/data#table-2"
          className="govuk-link govuk-body-m"
        >
          Cancel and go back
        </Link>
      </div>
    </Layout>
  );
}
