import '../../src/styles/main.scss';
import React from 'react';
import Layout from '../../src/components/common/layout/Layout';
import { Breadcrumb } from '../../src/data/interfaces/Breadcrumb';
import ButtonWithArrow from '@/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/authOptions';

export default async function HomePage() {
  const breadcrumbs: Array<Breadcrumb> = [
    {
      text: 'Homepage',
      url: '/home',
    },
  ];

  const session = await getServerSession(authOptions);

  return (
    <Layout
      autoSpaceMainContent={false}
      breadcrumbs={breadcrumbs}
      showLoginInformation={true}
      currentPage="home"
      session={session}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-l">
            Access data and insights for adult social care in England
          </h1>
        </div>
      </div>
      {!session ? (
        <>
          {/* TODO Add this Back when Needed */}
          {/* <div className="govuk-grid-row">
            <ButtonWithArrow buttonString="Register" buttonUrl="/register" />
          </div> */}
          <div className="govuk-grid-row">
            <ButtonWithArrow buttonString="Log in" buttonUrl="/login" />
          </div>
        </>
      ) : (
        <div className="govuk-grid-row">
          <p className="govuk-body"> Welcome back you are logged in!</p>
        </div>
      )}
    </Layout>
  );
}
