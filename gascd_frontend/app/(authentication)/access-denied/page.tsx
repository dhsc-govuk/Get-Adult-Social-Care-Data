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
                : 'You cannot access this service'}
            </h1>
            <p className="govuk-body">
              You do not currently have access to the Get Adult Social Care Data
              (GASCD) service.
            </p>
            <h2 className="govuk-heading-m">Access is available to:</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>CQC-registered Nominated Individuals</li>
              <li>CQC-registered Registered Managers</li>
              <li>Local Authority officers</li>
            </ul>

            {!ineligible && (
              <>
                <h2 className="govuk-heading-m">
                  Why you cannot access the service
                </h2>
                <p className="govuk-body">
                  The email address linked to your GOV.UK One Login does not
                  match the email address we have on record for you.
                </p>
                <p className="govuk-body">
                  We update our user records each month using information from
                  the Care Quality Commission (CQC) register. If you have
                  recently changed your details with CQC, it may take some time
                  before your updated information is reflected in our records.
                </p>
                <p className="govuk-body">
                  If you are signed in to GOV.UK One Login with a different
                  email address, you may need to{' '}
                  <a className="govuk-link" href="https://home.account.gov.uk">
                    sign out of your GOV.UK One Login account
                  </a>{' '}
                  before trying again.
                </p>

                <h2 className="govuk-heading-m">Check your details</h2>
                <p className="govuk-body">
                  If you believe your details are incorrect, you should first
                  check that your information held by CQC is up to date.
                </p>
              </>
            )}

            <h2 className="govuk-heading-m">Request access</h2>
            <p className="govuk-body">
              If you think you should have access to this service,{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link"
              >
                request access to this service
              </a>{' '}
              by email. Everyone will need to tell us their:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>full name</li>
              <li>organisation name</li>
              <li>role in the organisation</li>
            </ul>
            <p className="govuk-body">
              If you are a CQC-registered care provider, also include your:
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
