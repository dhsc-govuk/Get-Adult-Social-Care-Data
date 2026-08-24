import React from 'react';
import Layout from '@/components/common/layout/Layout';
import LookupLA from './LookupLAForm';

const EmailLookupPage: React.FC = () => {
  return (
    <Layout
      title="Check your email here"
      showLoginInformation={false}
      currentPage="lookup-email"
      showNavBar={false}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <LookupLA />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailLookupPage;
