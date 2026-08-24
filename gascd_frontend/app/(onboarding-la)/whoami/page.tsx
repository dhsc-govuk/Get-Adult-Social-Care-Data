import React from 'react';
import Layout from '@/components/common/layout/Layout';
import Whoami from './WhoamiForm';

const WhoamiPage: React.FC = () => {
  return (
    <>
      <Layout
        title="Who Are You?"
        showLoginInformation={false}
        currentPage="whoami"
        showNavBar={false}
      >
        <Whoami />
      </Layout>
    </>
  );
};

export default WhoamiPage;
