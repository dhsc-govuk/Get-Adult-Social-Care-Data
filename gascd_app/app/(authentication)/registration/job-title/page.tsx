'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import LabelledInput from '@/components/common/input/LabelledInput';

const RegisterJobTitlePage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (!window?.localStorage) return;

    const storedJobTitle = localStorage.getItem('jobTitle');

    storedJobTitle && setJobTitle(storedJobTitle);
  }, []);

  const handleSubmit = () => {
    localStorage.setItem('jobTitle', jobTitle);
  };

  return (
    <>
      <title>
        What is your job title - Get adult social care data - GOV.UK
      </title>
      <Layout showLoginInformation={false} currentPage={'register-job-title'}>
        <a href="/register/your-name" className="govuk-back-link">
          Back
        </a>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">What is your job title?</h1>

            <form
              className="form"
              action="organisation-type"
              method="post"
              onSubmit={handleSubmit}
            >
              <div className="govuk-form-group">
                <LabelledInput
                  inputId="register-job-title"
                  eventName="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  ariaLabel="Enter job title"
                ></LabelledInput>
              </div>

              <button className="govuk-button" type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default RegisterJobTitlePage;
