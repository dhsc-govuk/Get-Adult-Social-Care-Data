'use client';

import Breadcrumbs from '@/components/common/breadcrumbs/Breadcrumbs';
import Layout from '@/components/common/layout/Layout';
import React, { useEffect } from 'react';
import {
  Tabs,
  createAll,
} from '../../../../../../gascd_frontend/public/govuk-frontend/js/govuk-frontend.min.js';

export default function ProvisionAndOccupancyPage() {
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care homes',
      url: '', //to be added
    },
  ];

  useEffect(() => {
    createAll(Tabs);
  });

  return (
    <Layout
      title="Provision and occupancy"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="provision-and-occupancy"
    >
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Care home beds and occupancy levels
            </h1>
            <p className="govuk-body-l">
              Provision and capacity data for care homes, including local,
              regional and national statistics.
            </p>
            <h2 className="govuk-heading-l govuk-!-margin-top-9">
              Data overview
            </h2>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div className="data-box govuk-form-group">
              <div className="govuk-tabs" data-module="govuk-tabs">
                <h2 className="govuk-tabs__title">Contents</h2>
                <ul className="govuk-tabs__list">
                  <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                    <a className="govuk-tabs__tab" href="#chart">
                      Chart
                    </a>
                  </li>
                  <li className="govuk-tabs__list-item">
                    <a className="govuk-tabs__tab" href="#table">
                      Table
                    </a>
                  </li>
                </ul>
                <div className="govuk-tabs__panel" id="chart">
                  <h2 className="govuk-heading-m">Bar chart</h2>
                </div>
                <div
                  className="govuk-tabs__panel govuk-tabs__panel--hidden"
                  id="table"
                >
                  <h2 id="total" className="govuk-heading-m">
                    Table
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* carehome bed numbers data block */}
        {/* occupancy level data block */}
        {/* beds per care home and occupancy level data block */}
        {/* data indicator detains component */}
        {/* local market info component */}
        {/* back to top link */}
      </main>
    </Layout>
  );
}
