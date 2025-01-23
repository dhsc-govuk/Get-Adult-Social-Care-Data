'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';

const RegisterJobTitlePage: React.FC = () => {
  const [organisationType, setOrganisationType] = useState('');

  useEffect(() => {
    if (!window?.localStorage) return;

    const storedOrganisationType = localStorage.getItem('organisationType');

    storedOrganisationType && setOrganisationType(storedOrganisationType);
  }, []);

  const handleSubmit = () => {
    localStorage.setItem('organisationType', organisationType);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganisationType(e.target.value);
    console.log('Selected organisation type:', e.target.value); // Debugging
  };

  return (
    <Layout
      showLoginInformation={false}
      currentPage={'register-organisation-type'}
    >
      <a href="/register/job-title" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form
            className="form"
            action="organisation-name"
            method="post"
            onSubmit={handleSubmit}
          >
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h1 className="govuk-fieldset__heading">
                    What is your organisation type?
                  </h1>
                </legend>
                <div className="govuk-radios" data-module="govuk-radios">
                  {[
                    {
                      value: 'academicInstitution',
                      label: 'Academic institution',
                    },
                    { value: 'careProvider', label: 'Care provider' },
                    {
                      value: 'publicBody',
                      label: 'Government department or other public body',
                    },
                    { value: 'localAuthority', label: 'Local authority' },
                    {
                      value: 'membershipOrganisation',
                      label: 'Membership organisation',
                    },
                    { value: 'nhs', label: 'NHS' },
                    { value: 'other', label: 'Other' },
                  ].map(({ value, label }, index) => (
                    <div className="govuk-radios__item" key={value}>
                      <input
                        className="govuk-radios__input"
                        id={`whatOrganisationType-${index}`}
                        name="whatOrganisationType"
                        type="radio"
                        value={value}
                        checked={organisationType === value}
                        onChange={handleRadioChange}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`whatOrganisationType-${index}`}
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <button className="govuk-button" type="submit">
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterJobTitlePage;
