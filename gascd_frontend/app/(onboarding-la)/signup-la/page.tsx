import React from 'react';
import Layout from '@/components/common/layout/Layout';
import SignupLAForm from './SignupLAForm';
import Link from 'next/link';

const BACK_LINK = '/lookup-email';
const TEAM_EMAIL = 'getadultsocialcaredata.team@dhsc.gov.uk';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

/**
 * Reached two ways:
 * - from the lookup pre-check, when the typed address is not on a Local
 *   Authority domain (no `error` param);
 * - as the errorCallbackURL of the Local Authority One Login journey, when the
 *   address on the One Login account fails the check (`?error=<code>`).
 */
const SignupLAPage: React.FC<Props> = async ({ searchParams }) => {
  const { error } = await searchParams;
  const afterOneLogin = typeof error === 'string' && error.length > 0;

  return (
    <Layout
      title="We could not verify your email address"
      currentPage="signup-la"
      showLoginInformation={false}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            We could not verify your email address
          </h1>
          {afterOneLogin ? (
            <>
              <p className="govuk-heading-s">
                We could not verify that the email address linked to your GOV.UK
                One Login belongs to a Local Authority.
              </p>
              <p className="govuk-body">
                To use this service, sign in to GOV.UK One Login with an account
                that uses your Local Authority email address. If you are signed
                in with a different account, you may need to{' '}
                <a className="govuk-link" href="https://home.account.gov.uk">
                  sign out of your GOV.UK One Login account
                </a>{' '}
                first, then{' '}
                <Link href={BACK_LINK} className="govuk-link">
                  try again
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="govuk-heading-s">
                We could not verify that the email address you entered belongs
                to a Local Authority.
              </p>
              <p className="govuk-body">
                If you entered the wrong email address,{' '}
                <Link href={BACK_LINK} className="govuk-link">
                  go back
                </Link>{' '}
                and try again using your Local Authority email address.
              </p>
            </>
          )}
          <h2 className="govuk-heading-l">If you think there is a problem</h2>
          {/* Access request form: out of scope for now, kept for a later release.
          <p className="govuk-body">
            If you believe you should have access to this service, complete the
            access request form.
          </p>
          <SignupLAForm /> */}
          <p className="govuk-body">
            If you believe you should have access to this service, email the
            GASCD team at{' '}
            <a
              href={`mailto:${TEAM_EMAIL}`}
              className="govuk-link govuk-link--no-underline"
            >
              {TEAM_EMAIL}
            </a>
            . You will need to provide your:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>full name</li>
            <li>Local Authority, or the name of your organisation</li>
            <li>role in the organisation</li>
            <li>Local Authority email address</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default SignupLAPage;
