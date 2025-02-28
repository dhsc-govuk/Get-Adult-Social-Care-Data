'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';

const RegisterYourNamePage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organisationType, setOrganisationType] = useState('');
  const [organisationName, setOrganisationName] = useState('');

  useEffect(() => {
    if (!window?.localStorage) return;

    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    const storedJobTitle = localStorage.getItem('jobTitle');
    const storedOrganisationType = localStorage.getItem('organisationType');
    const storedOrganisationName = localStorage.getItem('organisationName');

    if (storedFirstName) setFirstName(storedFirstName);
    if (storedLastName) setLastName(storedLastName);
    if (storedJobTitle) setJobTitle(storedJobTitle);
    if (storedOrganisationType) setOrganisationType(storedOrganisationType);
    if (storedOrganisationName) setOrganisationName(storedOrganisationName);
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
                  {firstName || ''} {lastName || ''}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="/register/your-name">
                    Change<span className="govuk-visually-hidden"> name</span>
                  </a>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Job title</dt>
                <dd className="govuk-summary-list__value">{jobTitle || ''}</dd>
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
                  {organisationType || ''}
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
                  {organisationName || ''}
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
