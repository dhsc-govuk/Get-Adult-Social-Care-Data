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
import { Indicator } from '@/data/interfaces/Indicator';
import TableService from '@/services/Table/TableService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import ConditionalText from '@/components/common/conditional-text/ConditionalText';
import { LocationNames } from '@/data/interfaces/LocationNames';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import { Locations } from '@/data/interfaces/Locations';
import LogService from '@/services/logger/logService';
import AnalyticsService from '@/services/analytics/analyticsService';

export default function ProvisionAndOccupancyPage() {
  const [locationNames, setLocationNames] = useState<LocationNames>({
    IndicatorLabel: 'Indicator',
    LALabel: 'Loading...',
    RegionLabel: 'Loading...',
    CountryLabel: 'Loading...',
  } as LocationNames);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [CPLocationId, setCPLocationId] = useState<string>();
  const [demographicQuery, setDemographicQuery] = useState<IndicatorQuery>({
    metric_ids: [],
    location_ids: [],
  });
  const [filteredDemographicData, setFilteredDemographicData] = useState<
    Indicator[]
  >([]);

  const [selectedAge, setSelectedAge] = useState('aged-85-years-and-over');
  const [mapAvailable, setMapAvailable] = useState(true);
  const [mapStateKey, setMapStateKey] = useState(1);
  const [locationData, setLocationData] = useState<Locations | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const mapAlternative =
    'https://www.ons.gov.uk/census/maps/choropleth/population/age/resident-age-11a/aged-85-years-and-over';

  const { data: session } = authClient.useSession();

  const demographicMetricIds = [
    'total_population',
    'perc_18_64',
    'perc_65over',
    'perc_75over',
    'perc_85over',
  ];

  const breadcrumbs = [
    {
      text: 'Home',
      url: '/home',
    },
    {
      text: 'Population needs',
      url: '/population-needs/subtopics',
    },
  ];

  const handleAgeChange = (event: any) => {
    setSelectedAge(event.target.value);
  };

  const handleReset = (event: any) => {
    event.preventDefault();
    setMapStateKey(mapStateKey + 1);
  };

  const handleUpdateClick = (event: any) => {
    event.preventDefault();
    updateMap();
  };

  const updateMap = () => {
    if (locationData) {
      const newUrl = generatePopulationMapURL(
        locationData.la_code,
        selectedAge
      );
      if (newUrl) {
        setMapUrl(newUrl);
        setMapAvailable(true);
      } else {
        setMapAvailable(false);
      }
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      if (CPLocationId) {
        try {
          const location_data =
            await LocationService.getLocations(CPLocationId);
          setLocationData(location_data);
        } catch (error) {
          LogService.logEvent(
            'Error fetching location ids: ' + (error as Error).message
          );
        }
      }
    };
    fetchLocation();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationData) {
      updateMap();
    }
  }, [locationData]);

  useEffect(() => {
    const fetchSelectedLocation = async () => {
      const userLocationId = await LocationService.getSelectedLocation();
      if (!userLocationId) {
        // Can't load any data without a valid user location
        return;
      }
      setCPLocationId(userLocationId);
      AnalyticsService.trackMetricLocationView(userLocationId);
    };
    fetchSelectedLocation();
  }, [session]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (CPLocationId) {
        try {
          const locationNames = await LocationService.getLocationNames(
            CPLocationId,
            false
          );
          setLocationNames(locationNames);
        } catch (error) {
          console.error('Error fetching location names:', error);
        }
      }
    };
    fetchLocationNames();
  }, [CPLocationId]);

  useEffect(() => {
    if (locationIds.length > 0) {
      setDemographicQuery(() => ({
        metric_ids: demographicMetricIds,
        location_ids: locationIds,
      }));
    }
  }, [locationIds]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!CPLocationId) return;
      try {
        const demographicData: Indicator[] =
          await IndicatorFetchService.getData(demographicQuery);
        const filteredDemographicData =
          TableService.filterDate(demographicData);
        setFilteredDemographicData(filteredDemographicData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, [demographicQuery, CPLocationId]);

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

  return (
    <Layout
      title="Population size and age group percentages"
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="population-size-and-age-group"
      breadcrumbs={breadcrumbs}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Population size and age group percentages
          </h1>
          <p className="govuk-body-l">
            Population data at district, local authority, regional and national
            levels for England.
          </p>
          <h2 className="govuk-heading-l govuk-!-margin-top-9">
            Data overview
          </h2>
        </div>
      </div>
      <DataBox
        dataTitle="Adult population size with age group percentages"
        dataInfo={
          <p>
            Find out how{' '}
            <a href="/help/population-size" className="govuk-link">
              population size
            </a>{' '}
            and{' '}
            <a href="/help/population-age" className="govuk-link">
              age group percentages
            </a>{' '}
            are calculated.
          </p>
        }
      >
        <DataTabs
          id="1"
          table={
            <DataTable
              caption={`Table 1: population size and age group percentages – 
                ${locationNames.LALabel} local authority, 
                ${locationNames.RegionLabel} region and ${locationNames.CountryLabel}, mid-2024`}
              source={
                'Population estimates from the Office for National Statistics (ONS)'
              }
              columnHeaders={locationNames}
              rowHeaders={{
                total_population: 'Total adult population',
                perc_18_64: 'Aged 18 to 64',
                perc_65over: 'Aged 65 and over',
                perc_75over: 'Aged 75 and over',
                perc_85over: 'Aged 85 and over',
              }}
              data={filteredDemographicData}
              showCareProvider={false}
              percentageRows={[
                'perc_18_64',
                'perc_65over',
                'perc_75over',
                'perc_85over',
              ]}
              showAverageLabel={false}
            ></DataTable>
          }
          textSummary={
            <>
              <h4 className="govuk-heading-s">Text summary</h4>
              <ConditionalText
                data={filteredDemographicData}
                ColumnHeaders={locationNames}
                section="Drivers"
                metric_Id="perc_65over"
              ></ConditionalText>
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
        dataTitle="Age group percentages at district and Middle Layer Super Output Area (MSOA) level"
        dataInfo={
          <>
            Find out how{' '}
            <a href="/help/population-age" className="govuk-link">
              how age group percentages are calculated
            </a>
            .
          </>
        }
      >
        {mapAvailable && (
          <form action="population-age#map" method="post">
            <div className="govuk-form-block">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h3 className="govuk-fieldset__heading">Select age group</h3>
                </legend>

                <div
                  className="govuk-radios govuk-radios--inline govuk-radios--small"
                  data-module="govuk-radios"
                  data-govuk-radios-init=""
                >
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="mapAgeGroup-2"
                      name="mapAgeGroup"
                      type="radio"
                      onChange={handleAgeChange}
                      checked={selectedAge === 'aged-65-to-74-years'}
                      value="aged-65-to-74-years"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="mapAgeGroup-2"
                    >
                      Aged 65 to 74
                    </label>
                  </div>

                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="mapAgeGroup-3"
                      name="mapAgeGroup"
                      type="radio"
                      onChange={handleAgeChange}
                      checked={selectedAge === 'aged-75-to-84-years'}
                      value="aged-75-to-84-years"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="mapAgeGroup-3"
                    >
                      Aged 75 to 84
                    </label>
                  </div>

                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="mapAgeGroup-4"
                      name="mapAgeGroup"
                      type="radio"
                      onChange={handleAgeChange}
                      checked={selectedAge === 'aged-85-years-and-over'}
                      value="aged-85-years-and-over"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="mapAgeGroup-4"
                    >
                      Aged 85 and over
                    </label>
                  </div>
                </div>

                <button
                  className="govuk-button govuk-!-margin-top-2"
                  onClick={handleUpdateClick}
                >
                  Apply age group filter
                </button>
              </fieldset>
            </div>
          </form>
        )}

        {!mapAvailable && (
          <div>
            <p className="govuk-body">
              Map data is not currently available for your care home location.
            </p>
            <p className="govuk-body">
              <a
                href={mapAlternative}
                target="_blank"
                rel="noreferrer"
                className="govuk-link"
              >
                View the map on the Office for National Statistics website
                (opens in new tab)
              </a>
            </p>
          </div>
        )}

        {mapUrl && (
          <div className="govuk-form-group">
            <h3 className="govuk-heading-s">
              Figure 1: map of age group percentages for older age groups –
              local authority districts and MSOAs in England, mid-2024
            </h3>
            <iframe
              style={{ border: 0, width: '100%' }}
              key={mapStateKey}
              data-testid="map-frame"
              height="600px"
              title="ONS Census Maps"
              src={mapUrl}
            ></iframe>
          </div>
        )}

        {mapAvailable && !mapUrl && (
          <p className="govuk-body">Loading map...</p>
        )}

        {mapAvailable && (
          <p className="govuk-body govuk-!-margin-top-4">
            Source: Population estimates from the Office for National Statistics
            (ONS)
          </p>
        )}
      </DataBox>
      <DataIndicatorDetailsList>
        <DataLinkCard
          label="Age group percentages"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-age"
        />
        <DataLinkCard
          label="Population size"
          sources="Office for National Statistics"
          updateFrequency="Yearly updates"
          limitations={true}
          url="/help/population-size"
        />
      </DataIndicatorDetailsList>
      <LocalMarketInformation localAuthority={locationNames.LALabel} url="" />
      <BackToTop />
    </Layout>
  );
}
