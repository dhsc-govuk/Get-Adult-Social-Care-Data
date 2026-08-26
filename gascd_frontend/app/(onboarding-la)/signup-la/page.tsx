import React from 'react';
import Layout from '@/components/common/layout/Layout';
import SignupLAForm from './SignupLAForm';
import { withBasePath } from '@/lib/basePath';

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
            <a className="govuk-link" href={withBasePath('/lookup-email')}>
              go back
            </a>{' '}
            and try again using your Local Authority email address.
          </p>

          <h2 className="govuk-heading-l">If you think there is a problem</h2>
          <p className="govuk-body">
            If you believe you should have access to this service, complete the
            access request form.
          </p>

          <SignupLAForm />
        </div>
      </div>
    </Layout>
  );
};

export default SignupLAPage;
