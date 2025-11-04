'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TotalBedsFilters } from '@/data/interfaces/TotalBedsFilters';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import Layout from '@/components/common/layout/Layout';

const TableFiltersPage: React.FC = () => {
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
    if (selectedFilters) {
      localStorage.setItem('table-metrics', JSON.stringify(selectedFilters));
    }
  };

  return (
    <>
      <Layout
        title="Total beds per 100,000 population"
        showLoginInformation={true}
        currentPage={'/total-beds/filters'}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-m">
              Total beds per 100,000 population
            </span>
            <h1 className="govuk-heading-l">Edit table filter</h1>
            <p className="govuk-body">
              Select filters to refine the data displayed.
            </p>
            <h2 className="govuk-heading-m">Total</h2>
            <div className="govuk-form-group">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="Table-Filter-1"
                  name="Table filter"
                  type="checkbox"
                  value="bedcount_per_100000_adults_total"
                  onChange={(e) =>
                    handleCheckboxChange(e.target.value, e.target.checked)
                  }
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor="Table-Filter-1"
                >
                  All types
                </label>
              </div>
              <fieldset
                className="govuk-fieldset"
                aria-describedby="waste-hint"
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                  <h1 className="govuk-fieldset__heading">General</h1>
                </legend>
                <div
                  className="govuk-checkboxes"
                  data-module="govuk-checkboxes"
                >
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-2"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_transitional"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />

                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-2"
                    >
                      Transitional
                    </label>
                    <div
                      id="govuk-hint"
                      className="govuk-hint govuk-checkboxes__hint"
                    >
                      For individuals moving from childrens services to adult
                      social care.
                    </div>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-3"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_ypd_young_physically_disabled"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-3"
                    >
                      YPD - Young Physically Disabled
                    </label>
                  </div>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h1 className="govuk-fieldset__heading">Nursing</h1>
                  </legend>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-4"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_general_nursing"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-4"
                    >
                      General
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-5"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_dementia_nursing"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-5"
                    >
                      Dementia
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-6"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_learning_disability_nursing"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-6"
                    >
                      Learning Disability
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-7"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_mental_health_nursing"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-7"
                    >
                      Mental Health
                    </label>
                  </div>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h1 className="govuk-fieldset__heading">Residential</h1>
                  </legend>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-8"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_general_residential"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-8"
                    >
                      General
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-9"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_dementia_residential"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-9"
                    >
                      Dementia
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-10"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_learning_disability_residential"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-10"
                    >
                      Learning Disability
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="Table-Filter-11"
                      name="Table filter"
                      type="checkbox"
                      value="bedcount_per_100000_adults_total_mental_health_residential"
                      onChange={(e) =>
                        handleCheckboxChange(e.target.value, e.target.checked)
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="Table-Filter-11"
                    >
                      Mental Health
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <Link href="/metric/total-beds#table" onClick={handleSubmit}>
              <button type="button" className="govuk-button">
                Submit
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TableFiltersPage;
