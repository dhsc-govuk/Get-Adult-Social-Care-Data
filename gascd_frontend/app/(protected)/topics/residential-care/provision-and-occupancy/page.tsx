'use client';

import Breadcrumbs from '@/components/common/breadcrumbs/Breadcrumbs';
import Layout from '@/components/common/layout/Layout';
import React, { useEffect } from 'react';
import {
  Tabs,
  createAll,
} from '../../../../../../gascd_frontend/public/govuk-frontend/js/govuk-frontend.min.js';
import DataBox from '@/components/common/data-box/DataBox';

export default function ProvisionAndOccupancyPage() {
  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Care homes',
      url: '', //todo: update when care homes landing page is created
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
        {/* carehome bed numbers data block */}
        <DataBox
          dataTitle="Care home bed numbers"
          dataInfo={
            <>
              Find out{' '}
              <a
                href="/help/beds-per-100000-adult-population"
                className="govuk-link"
              >
                how the number of adult social care beds per 100,000 adult
                population is calculated
              </a>
            </>
          }
        >
          <ul className="govuk-tabs__list">
            <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
              <a className="govuk-tabs__tab" href="#chart1">
                Chart
              </a>
            </li>
            <li className="govuk-tabs__list-item">
              <a className="govuk-tabs__tab" href="#table1">
                Table
              </a>
            </li>
            <li className="govuk-tabs__list-item">
              <a className="govuk-tabs__tab" href="#download1">
                Download
              </a>
            </li>
          </ul>
          <div
            className="govuk-tabs__panel"
            id="chart1"
            style={{ backgroundColor: 'white' }}
          >
            <h4 className="govuk-heading-s">
              Figure 1: chart of care home beds per 100,000 adult population –
              local authorities in the East of England, October 2025
            </h4>
            <p className="govuk-body-m">
              Sources: Capacity Tracker from the Department of Health and Social
              Care (DHSC), population estimates from the Office for National
              Statistics (ONS)
            </p>
          </div>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="table1"
            style={{ backgroundColor: 'white' }}
          >
            <h4 className="govuk-heading-s">
              Table 1: care home beds per 100,000 adult population for regional
              local authorities – East of England, October 2025
            </h4>
            <p className="govuk-body-m">
              Sources: Capacity Tracker from the Department of Health and Social
              Care (DHSC), population estimates from the Office for National
              Statistics (ONS)
            </p>
          </div>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="download1"
            style={{ backgroundColor: 'white' }}
          >
            <h4 className="govuk-heading-s">Download</h4>
          </div>
        </DataBox>
        {/* occupancy level data block */}
        <DataBox
          dataTitle="Occupancy levels"
          dataInfo={
            <>
              Find out how{' '}
              <a href="/help/percentage-beds-occupied" className="govuk-link">
                occupancy level percentages
              </a>{' '}
              and{' '}
              <a
                href="/help/beds-care-provider-location"
                className="govuk-link"
              >
                the number of adult social care beds per 100,000 adult
                population
              </a>{' '}
              are calculated.
            </>
          }
        >
          <ul className="govuk-tabs__list">
            <li className="govuk-tabs__list-item">
              <a className="govuk-tabs__tab" href="#table2">
                Table
              </a>
            </li>
            <li className="govuk-tabs__list-item">
              <a className="govuk-tabs__tab" href="#download2">
                Download
              </a>
            </li>
          </ul>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="table2"
            style={{ backgroundColor: 'white' }}
          >
            <h4 className="govuk-heading-s">
              Table 2: care home bed numbers per 100,000 adult population and
              occupancy levels – Suffolk local authority, East of England region
              and England, October 2025
            </h4>
            <p className="govuk-body-m">
              Sources: Capacity Tracker from the Department of Health and Social
              Care (DHSC), population estimates from the Office for National
              Statistics (ONS)
            </p>
          </div>
          <div
            className="govuk-tabs__panel govuk-tabs__panel--hidden"
            id="download2"
            style={{ backgroundColor: 'white' }}
          >
            <h4 className="govuk-heading-s">Download</h4>
          </div>
        </DataBox>
        {/* beds per care home and occupancy level data block */}
        {/* data indicator detains component */}
        {/* local market info component */}
        {/* back to top link */}
      </main>
    </Layout>
  );
}
