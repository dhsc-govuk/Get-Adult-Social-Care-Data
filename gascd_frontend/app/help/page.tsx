'use client';
import React from 'react';
import Layout from '@/components/common/layout/Layout';
import AnalyticsService from '@/services/analytics/analyticsService';

const HelpPage = () => {
  const handleClick = () => {
    AnalyticsService.trackHelpEmailClicked();
  };

  return (
    <>
      <Layout
        title="Get help with the service"
        showLoginInformation={false}
        currentPage="help"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Get help with this service</h1>
            <p className="govuk-body">
              If you have any questions or need support with this service, email
              us at{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link"
                onClick={handleClick}
              >
                getadultsocialcaredata.team@dhsc.gov.uk
              </a>
              .
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HelpPage;
