import '../../src/styles/main.scss';
import React from 'react';
import Layout from '../../src/components/common/layout/Layout';
import { Breadcrumb } from '../../src/data/interfaces/Breadcrumb';
import ButtonWithArrow from '@/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';

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
      <div className="govuk-grid-row">
        <ButtonWithArrow buttonString="Register" buttonUrl="/register" />
      </div>
      <div className="govuk-grid-row">
        <ButtonWithArrow buttonString="Log in" buttonUrl="/login" />
      </div>
    </Layout>
  );
}
