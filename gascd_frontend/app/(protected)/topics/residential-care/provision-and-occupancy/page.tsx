'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import LocationService from '@/services/location/locationService';
import { Locations } from '@/data/interfaces/Locations';

export default function ProvisionAndOccupancyPage() {
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [locationNamesCP, setLocationNamesCP] = useState<string[]>([]);
  const [localAuthorityData, setLocalAuthorityData] = useState<Locations>();

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchCareProviderLocationName = async () => {
      const userLocationId = session?.user.locationId;
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      let foundLocationId;
      const storedLocationId = localStorage.getItem('selectedValue');
      if (storedLocationId) {
        // Check the stored value is actually valid
        if (
          await LocationService.checkCPLocation(
            storedLocationId,
            userLocationId
          )
        ) {
          foundLocationId = storedLocationId;
        } else {
          // Clear the local value if not valid
          console.warn('Invalid stored CP value found. Removing.');
          localStorage.removeItem('selectedValue');
        }
      } else {
        // get it from the user
        if (session.user.locationType == 'Care provider') {
          foundLocationId = await LocationService.getDefaultCPLocation(
            userLocationId,
            session.user.locationType
          );
        } else {
          foundLocationId = userLocationId;
        }
      }
      if (foundLocationId) {
        localStorage.setItem('selectedValue', foundLocationId);
        setCPLocationId(foundLocationId);
      }
    };
    fetchCareProviderLocationName();
  }, [session]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await LocationService.getLocationNames(
            CPLocationId,
            false
          );
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNames(locationNames);
          setLocationNamesCP(locationNamesCP);

          // XXX why do we need to call this quite so many times?
          const laData = await LocationService.getLocations(CPLocationId);
          setLocalAuthorityData(laData);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

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
      breadcrumbs={breadcrumbs}
    >
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
                Figure 1: chart of care home beds per 100,000 adult population –
                local authorities in the East of England, October 2025
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
      <DataBox
        dataTitle="Occupancy levels"
        dataInfo={
          <>
            Find out how{' '}
            <a href="/help/percentage-beds-occupied" className="govuk-link">
              occupancy level percentages
            </a>{' '}
            and{' '}
            <a href="/help/beds-care-provider-location" className="govuk-link">
              the number of adult social care beds per 100,000 adult population
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
                Table 2: care home bed numbers per 100,000 adult population and
                occupancy levels – Suffolk local authority, East of England
                region and England, October 2025
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
      <DataBox
        dataTitle="Beds per care home and occupancy levels"
        dataInfo={
          <>
            Find out how{' '}
            <a href="/help/percentage-beds-occupied" className="govuk-link">
              occupancy level percentages
            </a>{' '}
            and{' '}
            <a href="/help/beds-care-provider-location" className="govuk-link">
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
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Adult social care beds per 100,000 adult population"
          sources="Capacity Tracker, Office for National Statistics"
          updateFrequency="Daily"
          limitations={true}
          url="/help/beds-per-100000-adult-population"
        />
        <DataLinkCard
          label="Number of adult social care beds in a care provider location"
          sources="Capacity Tracker"
          updateFrequency="Daily"
          limitations={true}
          url="/help/beds-care-provider-location"
        />
        <DataLinkCard
          label="Occupancy level percentages for adult social care beds"
          sources="Capacity Tracker"
          updateFrequency="Daily"
          limitations={true}
          url="/help/percentage-beds-occupied"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNames[1]} url="" />
      <BackToTop />
    </Layout>
  );
}
