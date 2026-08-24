import React from 'react';
import Layout from '@/components/common/layout/Layout';
import WhoamiForm from './WhoamiForm';

const WhoamiPage: React.FC = () => {
  return (
    <>
      <Layout
        title="Who Are You?"
        showLoginInformation={false}
        currentPage="whoami"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <WhoamiForm />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default WhoamiPage;
