import React from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import LoginButton from '@/components/common/buttons/loginButton';

const LoginPage: React.FC = () => {
  return (
    <>
      <Layout
        title="Login"
        showLoginInformation={false}
        currentPage="login"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Get adult social care data</h1>
            <h2 className="govuk-heading-m">Introduction</h2>
            <p className="govuk-body">
              The government collects and stores a significant amount of adult
              social care data from care providers and local authorities. This
              data is currently used for government purposes. The government is
              in the process of building a new data service so that the existing
              data can also be used to help answer the questions that are most
              important to adult social care stakeholders, such as care
              providers.
            </p>
            <p className="govuk-body">
              This new digital service is owned by DHSC and is being developed
              by the data access project. Its aim is to support adult social
              care stakeholders to make better evidence-based decisions, which
              will help them improve outcomes for people who need adult social
              care services. The project does not collect any additional
              information, but instead aims to share data that is already being
              collected with people who need it. Data shared through the tool
              complies with current Data Sharing Agreements.
            </p>
            <p className="govuk-body">
              The information in this service has been developed and designed
              with ongoing support from a range of care providers, to understand
              what data insight is most useful. Over time, it is anticipated
              that the service will expand and change to include new topics and
              new user groups.
            </p>
            <p className="govuk-body">
              Please note that this service provides information only and does
              not constitute advice. DHSC does not accept any liability for
              decisions made by providers following use of this service. Further
              details are in the{' '}
              <a
                href="/disclaimer"
                className="govuk-link"
                rel="noreferrer noopener"
                target="_blank"
              >
                Full Disclaimer (opens in new tab)
              </a>
              .
            </p>
            <h2 className="govuk-heading-m">Beta phase testing</h2>
            <p className="govuk-body">
              Get Adult Social Care Data is a beta phase test of the service
              being shared with a limited number of care home providers for
              testing purposes only (private beta). Get adult social care data
              provides information, such as on current provision and capacity
              based on the latest information given to us by providers. The
              information is presented only to assist in testing the
              accessibility of information presented in this way, and not for
              commercial purposes. In agreeing to participate you have agreed
              not to publish, copy, share or otherwise reproduce this
              information or utilise this service for any commercial purposes.
            </p>
            <p className="govuk-inset-text">
              This service does not constitute advice, and the information
              presented in or by Get adult social care data is solely for the
              purpose of testing the service and must not be treated as
              accurate. Providers accessing this service must still carry out
              their own due diligence with respect to any information contained
              within it, including checking the accuracy of the information
              given. DHSC does not accept liability for any loss or damage that
              may come from the use of this service whether within the terms of
              its use or outside. Please refer to the{' '}
              <a
                href="/disclaimer"
                className="govuk-link"
                rel="noreferrer noopener"
                target="_blank"
              >
                Full Disclaimer (opens in new tab)
              </a>{' '}
              for further details.
            </p>
            <LoginButton />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
