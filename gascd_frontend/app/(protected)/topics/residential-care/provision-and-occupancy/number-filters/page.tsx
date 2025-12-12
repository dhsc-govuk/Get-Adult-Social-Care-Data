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
  };

  const selectedFilters = filters
    .filter((filter) => filter.checked)
    .map((filter) => ({
      metric_id: filter.metric_id,
      filter_bedtype: filter.filter_bedtype,
    }));

  const handleSubmit = () => {
    localStorage.setItem(
      'numbers-table-metrics',
      JSON.stringify(selectedFilters)
    );
    router.push(
      '/topics/residential-care/provision-and-occupancy/data#table-1'
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
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Care home bed types</span>
          <h1 className="govuk-heading-l">Edit filter</h1>
        </div>
      </div>
      <p className="govuk-body">
        Select the filter to refine the data displayed.
      </p>
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
                  onChange={(e) =>
                    handleCheckboxChange(e.target.value, e.target.checked)
                  }
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
    </Layout>
  );
}
