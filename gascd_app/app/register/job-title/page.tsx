'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

const RegisterJobTitlePage: React.FC = () => {
  return (
    <Layout showLoginInformation={false} currentPage={'register-job-title'}>
      <a href="/register/your-name" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">What is your job title?</h1>

          <form className="form" action="organisation-type" method="post">
            <div className="govuk-form-group">
              <input
                className="govuk-input govuk-input--width-20"
                id="register-job-title"
                name="jobTitle"
                type="text"
              />
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
