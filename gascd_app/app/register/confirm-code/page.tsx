'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

const RegisterConfirmCodePage: React.FC = () => {
  return (
    <Layout showLoginInformation={false} currentPage={'register-confirm-code'}>
      <a href="/register/email" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Enter code to confirm your email address
          </h1>
          <p className="govuk-body">
            We have sent a code to <strong>&apos;tbc&apos;</strong>
          </p>
          <p className="govuk-body">
            The email contains a 6-digit security code. The code expires after
            15 minutes.
          </p>

          <form className="form" action="your-name" method="post">
            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="enter-code">
                  Enter the 6 digit code
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-10"
                id="enter-code"
                name="enterCode"
                type="text"
              />
            </div>

            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  I did not receive the code
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  The email may take a few minutes to arrive. The subject of the
                  email is &apos;DHSC security code&apos;.
                </p>
                <p className="govuk-body">
                  If you still have not got the email, check your spam or junk
                  mail folder. If it is not there, we can{' '}
                  <a className="govuk-link" href="2-confirm-code">
                    send the code again
                  </a>
                  .
                </p>
              </div>
            </details>

            <button className="govuk-button" type="submit">
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterConfirmCodePage;
