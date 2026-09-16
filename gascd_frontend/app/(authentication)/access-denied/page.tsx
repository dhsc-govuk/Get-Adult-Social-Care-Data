'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';

/**
 * ?reason=ineligible is set when the visitor told us they are neither a care
 * provider nor a Local Authority officer. They have not tried to sign in, so
 * the One Login advice is omitted and the heading is phrased accordingly.
 */
const INELIGIBLE_REASON = 'ineligible';

const AccessDeniedContent: React.FC = () => {
  const searchParams = useSearchParams();
  const ineligible = searchParams?.get('reason') === INELIGIBLE_REASON;

  return (
    <>
      <Layout title="Access Denied" currentPage="access-denied">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              {ineligible
                ? 'You cannot use this service'
                : 'You do not have access to this service'}
            </h1>
            <div className="govuk-inset-text">
              <h2 className="govuk-heading-m">People with access</h2>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  CQC nominated individuals with a CQC registered email
                  addresses
                </li>
                <li>Local Authority officers</li>
              </ul>
            </div>

            {!ineligible && (
              <p className="govuk-body">
                If you are logged into GOV.UK One Login with a different email
                address, you may need to{' '}
                <a className="govuk-link" href="https://home.account.gov.uk">
                  sign out of your GOV.UK One Login account
                </a>{' '}
                before trying to access this service.
              </p>
            )}

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
            <p className="govuk-body">Everyone will need to tell us their:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>name</li>
              <li>organisation name</li>
              <li>role in organisation</li>
            </ul>
            <p className="govuk-body">
              If you are a CQC registered care provider, also include your:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>CQC registration number</li>
              <li>CQC registered email address</li>
            </ul>
            <p className="govuk-body">
              If you are a Local Authority officer, also include your:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Local Authority email address</li>
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

const AccessDeniedPage: React.FC = () => (
  <Suspense fallback={null}>
    <AccessDeniedContent />
  </Suspense>
);

export default AccessDeniedPage;
