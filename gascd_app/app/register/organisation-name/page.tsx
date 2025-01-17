'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

const RegisterYourNamePage: React.FC = () => {
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

          <form className="form" action="check-answers" method="post">
            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label
                  className="govuk-label"
                  htmlFor="register-organisation-name"
                >
                  Start typing for suggestions
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-organisation-name"
                name="organisationName"
                type="text"
              />
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
