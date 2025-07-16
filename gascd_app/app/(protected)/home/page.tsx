import React from 'react';
import Layout from '../../../src/components/common/layout/Layout';

export default async function HomePage() {
  return (
    <>
      <Layout
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="home"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Get adult social care data</h1>
            <p className="govuk-body-l">
              Access the latest data on adult social care capacity and
              population needs across England.
            </p>
            <h2 className="govuk-heading-m govuk-!-margin-top-7">
              Population needs
            </h2>
          </div>
        </div>

        <div className="govuk-grid-row">
          <a href="/present-demand">
            <div
              className="govuk-grid-column-one-half"
              style={{ backgroundColor: '#eee', paddingTop: '15px' }}
            >
              <h2 className="govuk-heading-m">Current population needs</h2>
              <p className="govuk-body">
                Assess data indicators on a range of factors shaping current
                population needs for adult social care.
              </p>
            </div>
          </a>
        </div>
      </Layout>
    </>
  );
}
