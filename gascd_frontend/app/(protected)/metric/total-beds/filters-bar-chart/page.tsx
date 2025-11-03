'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import Layout from '@/components/common/layout/Layout';
import { useRouter } from 'next/navigation';
import FiltersList from '@/components/indicator-components/Filters';

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
    <>
      <Layout
        title="Adult social care beds per 100,000 adult population"
        showLoginInformation={true}
        currentPage={'/metric/total-beds/filters'}
      >
        <Link href="/metric/total-beds#chart" className="govuk-back-link">
          Back
        </Link>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-m">
              Adult social care beds per 100,000 adult population
            </span>
            <h1 className="govuk-heading-l">Edit chart filter</h1>
            <p className="govuk-body">
              Select the filter to refine the data displayed.
            </p>
            <FiltersList
              filters={filters}
              onChange={handleRadioChange}
              useCheckboxes={false}
            />
            <Link href="/metric/total-beds#chart" onClick={handleSubmit}>
              <button type="button" className="govuk-button">
                Apply changes
              </button>
            </Link>
            <p className="govuk-body">
              <Link href="/metric/total-beds#chart" className="govuk-link">
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
