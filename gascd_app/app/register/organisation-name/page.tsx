'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import LabelledInput from '@/components/common/input/LabelledInput';

const RegisterYourNamePage: React.FC = () => {
  const [organisationName, setOrganisationName] = useState('');

  useEffect(() => {
    if (!window?.localStorage) return;

    const storedOrganisationName = localStorage.getItem('organisationName');

    storedOrganisationName && setOrganisationName(storedOrganisationName);
  }, []);

  const handleSubmit = () => {
    localStorage.setItem('organisationName', organisationName);
  };
  return (
    <Layout
      showLoginInformation={false}
      currentPage={'register-your-organisation-name'}
    >
      <a href="/register/organisation-type" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Enter your organisation&apos;s name
          </h1>

          <form
            className="form"
            action="check-answers"
            method="post"
            onSubmit={handleSubmit}
          >
            <div className="govuk-form-group">
              <LabelledInput inputId='register-organisation-name' eventName='organisationName' value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} 
                ariaLabel='Enter organisation name'>
                Start typing for suggestions
              </LabelledInput>
            </div>

            <p className="govuk-body">
              <a className="govuk-link" href="6a-organisation-name-manual">
                My organisation is not listed
              </a>
            </p>

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
