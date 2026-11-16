'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';

/**
 * ?reason=ineligible is set when the visitor told us they are neither a care
 * provider nor a Local Authority officer. They have not tried to sign in, so
 * the One Login advice is omitted and the heading is phrased accordingly.
 */
const INELIGIBLE_REASON = 'ineligible';
const CQC_SEARCH_URL = 'https://www.cqc.org.uk/search/services';
const TEAM_EMAIL = 'getadultsocialcaredata.team@dhsc.gov.uk';

const AccessDeniedContent: React.FC = () => {
  const searchParams = useSearchParams();
  const ineligible = searchParams?.get('reason') === INELIGIBLE_REASON;

  return (
    <Layout title="Access Denied" currentPage="access-denied">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            {ineligible
              ? 'You cannot use this service'
              : 'You do not have access to this service'}
          </h1>
          <p className="govuk-body">
            Get Adult Social Care Data (GASCD) is available to:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              Nominated Individuals (NIs) and Registered Managers (RMs)
              registered with the Care Quality Commission (CQC)
            </li>
            <li>people invited by their care provider&apos;s NI or RM</li>
            <li>Local Authority officers</li>
          </ul>

          {!ineligible && (
            <>
              <h2 className="govuk-heading-m">If you are an NI or RM</h2>
              <p className="govuk-body">
                You get access automatically. Sign in to GOV.UK One Login with
                the email address CQC has for you.
              </p>
              <p className="govuk-body">
                We update our records from the CQC register each month. If you
                have recently changed your details with CQC, it may take some
                time before we have them.
              </p>
              <p className="govuk-body">
                If you are signed in to GOV.UK One Login with a different email
                address,{' '}
                <a className="govuk-link" href="https://home.account.gov.uk">
                  sign out of your GOV.UK One Login account
                </a>{' '}
                before trying again.
              </p>
            </>
          )}

          <h2 className="govuk-heading-m">If you work for a care provider</h2>
          <p className="govuk-body">
            Ask your provider&apos;s NI or RM to invite you. You can{' '}
            <a
              className="govuk-link"
              href={CQC_SEARCH_URL}
              rel="noreferrer noopener"
              target="_blank"
            >
              find your provider on the CQC website (opens in new tab)
            </a>{' '}
            to see who they are.
          </p>
          {ineligible && (
            <p className="govuk-body">
              If you have already been invited,{' '}
              <Link className="govuk-link" href="/whoami">
                go back and choose CQC-registered care provider
              </Link>{' '}
              to sign in.
            </p>
          )}

          <h2 className="govuk-heading-m">
            If you are a Local Authority officer
          </h2>
          <p className="govuk-body">
            <Link className="govuk-link" href="/lookup-email">
              Sign up with your Local Authority email address
            </Link>
            .
          </p>

          <p className="govuk-body">
            Get support from:{' '}
            <a href={`mailto:${TEAM_EMAIL}`} className="govuk-link">
              {TEAM_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

const AccessDeniedPage: React.FC = () => (
  <Suspense fallback={null}>
    <AccessDeniedContent />
  </Suspense>
);

export default AccessDeniedPage;
