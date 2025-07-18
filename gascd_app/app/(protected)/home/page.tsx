'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from 'next-auth/react';

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <Layout
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="home"
        session={session}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Get adult social care data</h1>
            <p className="govuk-body-l">
              Access the latest data on adult social care capacity and
              population needs across England.
            </p>
            <h2 className="govuk-heading-m">Population needs</h2>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <a href="/present-demand" className="app-card">
              <h2 className="govuk-heading-m app-card__heading">
                Current population needs
              </h2>
              <p className="govuk-body">
                Assess data indicators on a range of factors shaping current
                population needs for adult social care.
              </p>
            </a>
          </div>

          <div className="govuk-grid-column-one-half">
            <a href="/population-age" className="app-card">
              <h2 className="govuk-heading-m app-card__heading">
                Population age
              </h2>
              <p className="govuk-body">[tbc]</p>
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
