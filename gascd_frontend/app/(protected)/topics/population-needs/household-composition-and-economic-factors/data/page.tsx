'use client';

import Layout from '@/components/common/layout/Layout';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import DataIndicatorDetailsList from '@/components/data-components/DataIndicatorDetailsList';
import DataLinkCard from '@/components/data-components/DataLinkCard';
import LocalMarketInformation from '@/components/data-components/LocalMarketInformation';
import BackToTop from '@/components/data-components/BackToTop';
import LocationService from '@/services/location/locationService';
import DataTable from '@/components/tables/table';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';
import { MetaData } from '@/data/interfaces/MetaData';
import { LocationNames } from '@/data/interfaces/LocationNames';
import Link from 'next/link';

export default function ProvisionAndOccupancyPage() {
  const [locationNamesCP, setLocationNamesCP] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [metricDateType, setMetricDataType] = useState<MetaData[]>([]);

  const { data: session } = authClient.useSession();

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/topics/population-needs/subtopics',
    },
  ];

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
          const locationNamesCP = await LocationService.getLocationNames(
            CPLocationId,
            true
          );
          setLocationNamesCP(locationNamesCP);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchLocationIds = async () => {
      if (CPLocationId) {
        try {
          const locationids = await LocationService.getLocationIds(
            CPLocationId,
            false
          );
          setLocationIds(locationids);
        } catch (error) {
          console.error('Error fetching location ids:', error);
        }
      }
    };
    fetchLocationIds();
  }, [CPLocationId]);

  useEffect(() => {
    const fetchMetadataByType = async () => {
      try {
        setMetricDataType(
          await IndicatorFetchService.getMetadateByType('Percentage')
        );
      } catch (error) {
        console.error('Error fetching metadata types:', error);
      }
    };
    fetchMetadataByType();
  }, []);

  const cleanupLocationIDs = (location_ids_to_clean: string[]) => {
    // XXX Ideally the functions using this would use a different list of location IDs which didn't have
    // the 'Filter' word crowbarred into it from the Present Demand service.
    return location_ids_to_clean.filter((item) => item !== 'Indicator');
  };

  return (
    <Layout
      title="Economic factors and household composition"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="economic-factors-and-household-composition"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Economic factors and household composition
          </h1>
          <p className="govuk-body-l">
            Data on household deprivation, property ownership and older people
            living alone.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Household deprivation"
        dataInfo={
          <>
            In Census 2021, households were classified by 4 dimensions of
            deprivation: education, employment, health and disability, and
            household overcrowding.
          </>
        }
      >
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              How the 4 dimensions of deprivation are measured
            </span>
          </summary>
          <div className="govuk-details__text">
            <p>
              All the following characteristics must apply for a household to be
              classified as &lsquo;deprived in 4 dimensions&rsquo; in Census
              2021 data.
            </p>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>
                No one in the household has at least level 2 education and no
                one aged 16 to 18 years is a full-time student.
              </li>
              <li>
                A household member is unemployed or economically inactive due to
                long-term sickness or disability, and is not a full-time
                student.
              </li>
              <li>
                Any member of the household has general health that is bad or
                very bad, or is identified as disabled.
              </li>
              <li>
                The household&apos;s accommodation is overcrowded, is in a
                shared dwelling, or has no central heating.
              </li>
            </ol>
            <Link
              className="govuk-link"
              href="https://gascd-prototype.azurewebsites.net/private-beta/2025/december/signed-in/help/household-deprivation"
            >
              More details on household deprivation data.
            </Link>
          </div>
        </details>
        <DataTabs
          id="1"
          table={
            <DataTable
              caption={`
                Table 1: percentage of households classified as ‘deprived in 4 dimensions’ – ${locationNamesCP.LALabel} local authority, ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={{
                percent_of_deprived_households:
                  'Percentage of households deprived in 4 dimensions: education, employment, health and housing',
              }}
              data={''}
              showCareProvider={false}
              careProviderMedianMetrics={''}
              percentageRows={metricDateType}
              showAverageLabel={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="Households where the property is owned outright"
        dataInfo={
          <>
            <p>
              This is when the property does not have an outstanding mortgage or
              any other type of loan attached to it.
            </p>
            <p>
              Find out{' '}
              <a
                href="/help/households-where-property-is-owned-outright"
                className="govuk-link"
              >
                how data on property ownership is collected
              </a>
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <DataTable
              caption={`
                                Table 2: percentage of households where the property is owned outright – ${locationNamesCP.LALabel} local authority, ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={{
                percent_property_owned_outright:
                  'Percentage of households where the property is owned outright',
              }}
              data={''}
              showCareProvider={false}
              careProviderMedianMetrics={''}
              percentageRows={metricDateType}
              showAverageLabel={false}
            ></DataTable>
          }
          download={
            <>
              <h4 className="govuk-heading-s">Download</h4>
            </>
          }
        />
      </DataBox>
      <DataBox
        dataTitle="One-person households where the person is aged 65 or over"
        dataInfo={
          <>
            <p>
              Find out{' '}
              <a
                href="/help/one-person-households-where-person-aged-65-or-over"
                className="govuk-link"
              >
                how the percentage of one-person households where the person is
                aged 65 or over is calculated
              </a>
            </p>
          </>
        }
      >
        <DataTabs
          id="2"
          table={
            <DataTable
              caption={`
                                Table 3: percentage of one-person households where the person is aged 65 or over – ${locationNamesCP.LALabel} local authority, ${locationNamesCP.RegionLabel} region and ${locationNamesCP.CountryLabel}, March 2021`}
              source={
                'Census 2021 from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNamesCP}
              rowHeaders={{
                percent_one_person_households_over_65:
                  'Percentage of one-person households where the person is aged 65 or over',
              }}
              data={''}
              showCareProvider={false}
              careProviderMedianMetrics={''}
              percentageRows={metricDateType}
              showAverageLabel={false}
            ></DataTable>
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
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={true}
          url="/help/household-deprivation"
        />
        <DataLinkCard
          label="Households where the property is owned outright"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={true}
          url="/help/households-where-property-is-owned-outright"
        />
        <DataLinkCard
          label="One-person households where the person is aged 65 or over"
          sources="Office for National Statistics"
          updateFrequency="Updates every 10 years"
          limitations={true}
          url="/help/one-person-households-where-person-aged-65-or-over"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNamesCP.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
