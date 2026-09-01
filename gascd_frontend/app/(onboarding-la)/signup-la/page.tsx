import React from 'react';
import Layout from '@/components/common/layout/Layout';
import SignupLAForm from './SignupLAForm';
import Link from 'next/link';

const BACK_LINK = '/lookup-email';

const SignupLAPage: React.FC = () => {
  return (
    <Layout
      title="Signup LA"
      currentPage="signup-la"
      showLoginInformation={false}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            We could not verify your email address
          </h1>
          <p className="govuk-heading-s">
            We could not verify that the email address you entered belongs to a
            Local Authority.
          </p>
          <p className="govuk-body">
            If you entered the wrong email address,{' '}
            <Link href={BACK_LINK} className="govuk-link">
              go back
            </Link>{' '}
            and try again using your Local Authority email address.
          </p>
          <h2 className="govuk-heading-l">If you think there is a problem</h2>
          {/* <p className="govuk-body">
            If you believe you should have access to this service, complete the
            access request form.
          </p> */}
          {/* <SignupLAForm /> */}
          <p className="govuk-body">
            If you believe you should have access to this service, please
            contact the GASCD team at
            <a
              href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
              className="govuk-link govuk-link--no-underline"
            >
              getadultsocialcaredata.team@dhsc.gov.uk
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignupLAPage;
