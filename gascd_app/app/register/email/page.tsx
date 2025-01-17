'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';

const RegisterEmailPage: React.FC = () => {
  return (
    <Layout showLoginInformation={false} currentPage={'register-email'}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Sign in to Get adult social care data or request access
          </h1>

          <form className="form" action="confirm-code" method="post">
            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="register-email">
                  Enter your email address
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-email"
                name="eventName"
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

export default RegisterEmailPage;
