'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

const RegisterYourNamePage: React.FC = () => {
  return (
    <Layout showLoginInformation={false} currentPage={'register-your-name'}>
      <a href="/register/confirm-code" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">What is your name?</h1>

          <form className="form" action="job-title" method="post">
            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="register-first-name">
                  First Name
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-first-name"
                name="firstName"
                type="text"
              />
            </div>

            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="register-last-name">
                  Last Name
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-last-name"
                name="lastName"
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

export default RegisterYourNamePage;
