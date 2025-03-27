'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';

const RegisterYourNamePage: React.FC = () => {
  return (
    <>
      <title>
        Request for access submitted - Get adult social care data - GOV.UK
      </title>
      <Layout showLoginInformation={false} currentPage={'register-your-name'}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Request for access submitted
              </h1>
            </div>

            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              The Department for Health and Social Care (DHSC) will review your
              request to access the Get adult social care data service.
            </p>
            <p className="govuk-body">
              DHSC will normally contact you within x working days to grant
              access or ask for more information. During busy periods, this may
              take longer.
            </p>

            <h2 className="govuk-heading-m">Help us improve this service</h2>

            <p className="govuk-body">
              <a href="#" className="govuk-link">
                Give your feedback
              </a>{' '}
              (takes 30 seconds)
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default RegisterYourNamePage;
