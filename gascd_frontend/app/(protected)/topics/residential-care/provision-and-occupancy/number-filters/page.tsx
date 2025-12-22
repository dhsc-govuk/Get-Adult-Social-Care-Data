'use client';

import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { useRouter } from 'next/navigation';

export default function ProvisionAndOccupancyNumbersFiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<TotalBedsFilters[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<TotalBedsFilters>();

  useEffect(() => {
    const getFilters = async () => {
      const filters: TotalBedsFilters[] =
        await IndicatorFetchService.getFilters('');
      setFilters(filters);

      const storedData = localStorage.getItem('numbers-table-metrics');
      if (storedData) {
        setSelectedFilter(JSON.parse(storedData));
      } else {
        setSelectedFilter({
          metric_id: 'bedcount_per_100000_adults_total',
          filter_bedtype: 'All bed types',
        });
      }
    };
    getFilters();
  }, []);

  const handleChange = (filter: TotalBedsFilters) => {
    setSelectedFilter(filter);
  };

  const handleSubmit = () => {
    localStorage.setItem(
      'numbers-table-metrics',
      JSON.stringify(selectedFilter)
    );
    router.push(
      '/topics/residential-care/provision-and-occupancy/data#chart-1'
    );
    router.refresh();
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
      <fieldset className="govuk-fieldset" aria-describedby="bedType-hint">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
          <span className="govuk-caption-xl">Care home bed numbers</span>
          <h1 className="govuk-fieldset__heading">Edit filter</h1>
        </legend>

        <div id="bedType-hint" className="govuk-hint govuk-!-margin-top-6">
          Select the filter to refine the data displayed.
        </div>
        <form>
          <div className="govuk-form-group">
            {filters &&
              filters.map((filter: any, index) => (
                <div className="govuk-radios__item" key={index}>
                  <input
                    className="govuk-radios__input"
                    id={filter.metric_id}
                    name="Table filter"
                    type="radio"
                    value={filter.metric_id}
                    defaultChecked={
                      selectedFilter?.metric_id === filter.metric_id
                    }
                    onChange={() => handleChange(filter)}
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor={filter.metric_id}
                  >
                    {filter.filter_bedtype}
                  </label>
                </div>
              ))}
          </div>
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              onClick={() => handleSubmit()}
            >
              Apply changes
            </button>
            <Link
              href="/topics/residential-care/provision-and-occupancy/data#table-1"
              className="govuk-link govuk-body-m"
            >
              Cancel and go back
            </Link>
          </div>
        </form>
      </fieldset>
    </Layout>
  );
}
