'use client';

import Breadcrumbs from '@/components/common/breadcrumbs/Breadcrumbs';
import Layout from '@/components/common/layout/Layout';
import React from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataIndicatorDetail from '@/components/data-components/DataIndicatorDetail';

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
          <DataTabs
            id="1"
            chart={
              <>
                <h4 className="govuk-heading-s">
                  Figure 1: chart of care home beds per 100,000 adult population
                  – local authorities in the East of England, October 2025
                </h4>
                <p className="govuk-body-m">
                  Sources: Capacity Tracker from the Department of Health and
                  Social Care (DHSC), population estimates from the Office for
                  National Statistics (ONS)
                </p>
              </>
            }
            table={
              <>
                <h4 className="govuk-heading-s">
                  Table 1: care home beds per 100,000 adult population for
                  regional local authorities – East of England, October 2025
                </h4>
                <p className="govuk-body-m">
                  Sources: Capacity Tracker from the Department of Health and
                  Social Care (DHSC), population estimates from the Office for
                  National Statistics (ONS)
                </p>
              </>
            }
            download={
              <>
                <h4 className="govuk-heading-s">Download</h4>
              </>
            }
          />
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
          <DataTabs
            id="2"
            table={
              <>
                <h4 className="govuk-heading-s">
                  Table 2: care home bed numbers per 100,000 adult population
                  and occupancy levels – Suffolk local authority, East of
                  England region and England, October 2025
                </h4>
                <p className="govuk-body-m">
                  Sources: Capacity Tracker from the Department of Health and
                  Social Care (DHSC), population estimates from the Office for
                  National Statistics (ONS)
                </p>
              </>
            }
            download={
              <>
                <h4 className="govuk-heading-s">Download</h4>
              </>
            }
          />
        </DataBox>
        {/* beds per care home and occupancy level data block */}
        <DataBox
          dataTitle="Beds per care home and occupancy levels"
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
                number of adult social care beds in a care provider location
              </a>{' '}
              are calculated.
            </>
          }
        >
          <DataTabs
            id="3"
            table={
              <>
                <h4 className="govuk-heading-s">
                  Table 3: care home bed numbers and occupancy levels – Shoggins
                  Care Services (Sudbury), Suffolk local authority, East of
                  England region and England, October 2025
                </h4>
                <p className="govuk-body-m">
                  Sources: Capacity Tracker from the Department of Health and
                  Social Care (DHSC)
                </p>
              </>
            }
            download={
              <>
                <h4 className="govuk-heading-s">Download</h4>
              </>
            }
          />
        </DataBox>
        {/* data indicator detains component */}
        <DataIndicatorDetailsList>
          <DataIndicatorDetail
            label="Adult social care beds per 100,000 adult population"
            sources="Capacity Tracker, Office for National Statistics"
            updateFrequency="Daily"
            limitations={true}
            url="/help/beds-per-100000-adult-population"
          />
          <DataIndicatorDetail
            label="Number of adult social care beds in a care provider location"
            sources="Capacity Tracker"
            updateFrequency="Daily"
            limitations={true}
            url="/help/beds-care-provider-location"
          />
          <DataIndicatorDetail
            label="Occupancy level percentages for adult social care beds"
            sources="Capacity Tracker"
            updateFrequency="Daily"
            limitations={true}
            url="/help/percentage-beds-occupied"
          />
        </DataIndicatorDetailsList>
        {/* local market info component */}
        {/* back to top link */}
      </main>
    </Layout>
  );
}
