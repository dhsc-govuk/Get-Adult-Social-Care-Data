'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import Feedback from '../../../src/components/common/feedback/Feedback';
import { authClient } from '@/utils/auth-client';

const HomePage: React.FC = () => {
  const {data: session } = authClient.useSession();
  return (
    <>
      <Layout
        title="Home"
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="home"
        session={session}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Get adult social care data</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-9">
              Access the latest data on population needs and adult social care
              capacity at national, regional and local levels in England.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <a href="/present-demand" className="app-card">
              <h2 className="govuk-heading-m app-card__heading">
                Current population needs and capacity
              </h2>
              <p className="govuk-body">
                Find and compare data indicators for current population needs
                and adult social care capacity.
              </p>
            </a>
          </div>

          <div className="govuk-grid-column-one-half">
            <a href="/population-age" className="app-card">
              <h2 className="govuk-heading-m app-card__heading">
                Map of population age percentages
              </h2>
              <p className="govuk-body">
                Use the map to view population percentages for older age groups
                at local levels in England.
              </p>
            </a>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible"></hr>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <Feedback highlight={false} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
