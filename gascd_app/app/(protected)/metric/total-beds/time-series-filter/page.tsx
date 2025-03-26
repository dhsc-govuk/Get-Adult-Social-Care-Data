'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import Layout from '@/components/common/layout/Layout';
import Filters from '@/components/indicator-components/Filters';

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

  const handleCheckboxChange = (index: number, checked?: boolean) => {
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

  const handleSubmit = () => {
    if (selectedFilters) {
      localStorage.setItem(
        'time-series-metrics',
        JSON.stringify(selectedFilters)
      );
    }
  };

  return (
    <>
      <title>Edit time series filter</title>
      <Layout
        showLoginInformation={true}
        currentPage={'/metric/total-beds/time-series-filter'}
      >
        <a href="/metric/total-beds#time-series" className="govuk-back-link">
          Back
        </a>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-m">
              Total beds per 100,000 population
            </span>
            <h1 className="govuk-heading-l">Edit time series filters</h1>
            <p className="govuk-body">
              Select filters to refine the data displayed.
            </p>
            <Filters
              filters={filters}
              onChange={handleCheckboxChange}
              useCheckboxes={true}
            />
            <Link href="/metric/total-beds#time-series" onClick={handleSubmit}>
              <button type="button" className="govuk-button">
                Apply changes
              </button>
            </Link>
            <p className="govuk-body">
              <Link
                href="/metric/total-beds#time-series"
                className="govuk-link"
              >
                Cancel and go back
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TotalBedsFiltersPage;
