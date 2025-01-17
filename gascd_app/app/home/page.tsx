import '../../src/styles/main.scss';
import React from 'react';
import Layout from '../../src/components/common/layout/Layout';
import { Breadcrumb } from '../../src/data/interfaces/Breadcrumb';

export default async function HomePage() {
  const breadcrumbs: Array<Breadcrumb> = [
    {
      text: 'Homepage',
      url: '/home',
    },
  ];

  return (
    <Layout
      autoSpaceMainContent={false}
      breadcrumbs={breadcrumbs}
      showLoginInformation={true}
      currentPage="home"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-l">
            Access data and insights for adult social care in England
          </h1>
        </div>
      </div>
    </Layout>
  );
}
