'use client';
import React from 'react';
import Layout from '@/components/common/layout/Layout';

const AccessDeniedPage: React.FC = () => {
  return (
    <>
      <Layout title="Access Denied" currentPage="access-denied">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              You do not have access to this service
            </h1>
            <div className="govuk-inset-text">
              <h2 className="govuk-heading-m">People with access</h2>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  CQC nominated individuals with a CQC registered email
                  addresses
                </li>
                <li>Local Authority ASC representatives</li>
              </ul>
            </div>

            <p className="govuk-body">
              If you are logged into GOV.UK One Login with a different email
              address, you may need to{' '}
              <a className="govuk-link" href="https://home.account.gov.uk">
                sign out of your GOV.UK One Login account
              </a>{' '}
              before trying to access this service.
            </p>

            <p className="govuk-body">
              If you think you need access,{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link"
              >
                request access to this service
              </a>
              .
            </p>
            <p className="govuk-body">We will need your:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>name</li>
              <li>organisation name</li>
              <li>CQC registration number</li>
              <li>CQC registered email address</li>
              <li>gov.uk email address</li>
            </ul>

            <p className="govuk-body">
              Get support from:{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link"
              >
                getadultsocialcaredata.team@dhsc.gov.uk
              </a>
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AccessDeniedPage;
