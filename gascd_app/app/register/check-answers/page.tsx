'use client';

import React, { useEffect } from 'react';
import Layout from '@/components/common/layout/Layout';

const RegisterYourNamePage: React.FC = () => {
  useEffect(() => {
    if (!window?.localStorage) return;
  });

  const handleSubmit = () => {
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('jobTitle');
    localStorage.removeItem('organisationType');
    localStorage.removeItem('organisationName');
  };
  return (
    <Layout showLoginInformation={false} currentPage={'register-check-answers'}>
      <a href="/register/organisation-name" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Check your answers before submitting your request
          </h1>

          <form
            className="form"
            action="complete"
            method="post"
            onSubmit={handleSubmit}
          >
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Name</dt>
                <dd className="govuk-summary-list__value">
                  {localStorage.getItem('firstName') || ''}{' '}
                  {localStorage.getItem('lastName') || ''}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="/register/your-name">
                    Change<span className="govuk-visually-hidden"> name</span>
                  </a>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Job title</dt>
                <dd className="govuk-summary-list__value">
                  {localStorage.getItem('jobTitle') || ''}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="/register/job-title">
                    Change
                    <span className="govuk-visually-hidden"> job title</span>
                  </a>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Organisation type</dt>
                <dd className="govuk-summary-list__value">
                  {localStorage.getItem('organisationType') || ''}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="/register/organisation-type">
                    Change
                    <span className="govuk-visually-hidden">
                      {' '}
                      organisation type
                    </span>
                  </a>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Organisation name</dt>
                <dd className="govuk-summary-list__value">
                  {localStorage.getItem('organisationName') || ''}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="/register/organisation-name">
                    Change
                    <span className="govuk-visually-hidden">
                      {' '}
                      organisation name
                    </span>
                  </a>
                </dd>
              </div>
            </dl>

            <button className="govuk-button" type="submit">
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterYourNamePage;
