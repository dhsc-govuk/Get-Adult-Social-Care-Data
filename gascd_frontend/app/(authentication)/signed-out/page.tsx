import React from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { FALLBACK_FEEDBACK_URL } from '@/components/common/feedback/Feedback';

const SignedOutPage: React.FC = () => {
  return (
    <>
      <Layout
        title="You have signed out"
        showLoginInformation={false}
        currentPage="signed-out"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">You have signed out</h1>
            <p className="govuk-body">
              <a href="/login" className="govuk-button">
                Sign in again
              </a>
            </p>

            <h2 className="govuk-heading-m">
              Give your feedback on the service
            </h2>
            <p className="govuk-body">
              Thank you for volunteering to test the new Get adult social care
              data service from the Department of Health and Social Care (DHSC).
            </p>
            <p className="govuk-body">
              We&rsquo;re keen to hear about your experience using the service.
              Your feedback will help us make improvements and add new features.
            </p>
            <p className="govuk-body">
              <a
                href={FALLBACK_FEEDBACK_URL}
                className="govuk-link"
                rel="noreferrer noopener"
                target="_blank"
              >
                Fill in the feedback survey (opens in new tab)
              </a>
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SignedOutPage;
