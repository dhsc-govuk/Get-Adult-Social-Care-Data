'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from 'next-auth/react';
import '../../../src/styles/population-age.scss';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { Locations } from '@/data/interfaces/Locations';
import { generatePopulationMapURL } from '@/helpers/maps/mapsupport';
import LogService from '@/services/logger/logService';

export default function PopulationAgePage() {
  const { data: session, status } = useSession();
  const [selectedAge, setSelectedAge] = useState('aged-85-years-and-over');
  const [CPLocationId, setCPLocationId] = useState('');
  const [mapAvailable, setMapAvailable] = useState(true);
  const [mapStateKey, setMapStateKey] = useState(1);
  const [locationData, setLocationData] = useState<Locations | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const mapAlternative =
    'https://www.ons.gov.uk/census/maps/choropleth/population/age/resident-age-11a/aged-85-years-and-over';

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
    if (session) {
      // This pattern is pretty common in the app and could
      // do with being more reusable
      let locationId = session.user.locationId;
      let locationType = session.user.locationType;
      if (locationType == 'Care provider') {
        locationId = localStorage.getItem('selectedValue')!;
      }
      if (locationId) {
        setCPLocationId(locationId);
      }
    }
  }, [session]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (CPLocationId) {
        try {
          const location_data =
            await PresentDemandService.getLocations(CPLocationId);
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
    if (locationData && locationData.la_code) {
      updateMap();
    }
  }, [locationData]);

  return (
    <>
      <Layout
        autoSpaceMainContent={false}
        showLoginInformation={true}
        backURL="/home"
        currentPage="population-age"
        session={session}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Population age percentages</h1>
            <p className="govuk-body-l">
              Use the map to view population percentages for older age groups at
              local levels in England.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 id="map" className="govuk-heading-m govuk-!-padding-top-7">
              Map of population percentages for older age groups
            </h2>
            <p className="govuk-body">
              <strong>Your care home location:</strong>
              <br />
              {(locationData && (
                <span>
                  {locationData?.provider_location_name},{' '}
                  {locationData?.la_name}
                </span>
              )) ||
                'Loading'}
              <br />
              {mapAvailable && (
                <a href="#" className="govuk-link" onClick={handleReset}>
                  Reset map to this location
                </a>
              )}
            </p>

            {mapAvailable && (
              <form action="population-age#map" method="post">
                <div className="govuk-form-block">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                      <h3 className="govuk-fieldset__heading">
                        Select age group
                      </h3>
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
                      className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                      onClick={handleUpdateClick}
                    >
                      Apply age group filter
                    </button>
                  </fieldset>
                </div>
              </form>
            )}

            {!mapAvailable && (
              <p>
                Map data is not currently available for your care home location.
                <br />
                You can{' '}
                <a href={mapAlternative} target="_blank" rel="noreferrer">
                  browse the entire map on the ONS website.
                </a>
              </p>
            )}

            {mapUrl && (
              <div className="govuk-form-group">
                <h3 className="govuk-heading-s">
                  Map showing population age group percentages at local
                  authority district level and Middle Layer Super Output Area
                  (MSOA) level
                </h3>
                <iframe
                  key={mapStateKey}
                  data-testid="map-frame"
                  width="100%"
                  height="600px"
                  title="ONS Census Maps"
                  frameBorder="0"
                  src={mapUrl}
                ></iframe>
              </div>
            )}

            {mapAvailable && !mapUrl && <p>Loading map...</p>}

            {mapAvailable && (
              <p className="govuk-body">
                Source:{' '}
                <a
                  href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                  className="govuk-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Office for National Statistics (opens in new tab)
                </a>
                <br />
                Data correct as of March 2021
              </p>
            )}
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-top-9" id="footnotes">
              Footnotes
            </h2>
            <p className="govuk-body">
              Find out how each indicator is defined, sourced, and updated.
            </p>
            <p className="govuk-body">
              Select an indicator to view its footnotes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <a href="../help/population-size" className="govuk-link">
                  Population size
                </a>
              </li>
              <li>
                <a href="../help/population-age" className="govuk-link">
                  Percentage of population in age group
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
}
