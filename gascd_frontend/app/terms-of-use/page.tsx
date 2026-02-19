import React from 'react';
import Layout from '@/components/common/layout/Layout';
import TermsOfUse from '@/components/terms-of-use/TermsOfUse';

const TermsOfUsePage: React.FC = () => {
  return (
    <>
      <Layout
        title="Terms of use"
        showLoginInformation={false}
        currentPage="terms-of-use"
        showNavBar={false}
      >
        <TermsOfUse />
      </Layout>
    </>
  );
};

export default TermsOfUsePage;
