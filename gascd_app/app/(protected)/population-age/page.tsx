'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from 'next-auth/react';
import '../../../src/styles/population-age.scss';

const PopulationAgePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [selectedAge, setSelectedAge] = useState('aged-85-years-and-over');
  const [mapUrl, setMapUrl] = useState('');

  const handleAgeChange = (event) => {
    event.preventDefault();
    setSelectedAge(event.target.value);
  };

  const handleUpdateClick = (event) => {
    event.preventDefault();
    updateMap();
  };

  const updateMap = () => {
    let baseUrl = `https://www.ons.gov.uk/census/maps/choropleth/population/age/resident-age-11a`;
    let map_qs =
      'lad=E07000203&embed=true&embedInteractive=true&embedAreaSearch=false&embedCategorySelection=false&embedView=viewport';
    map_qs +=
      '&embedBounds=0.4518427976473447,51.95149998586203,1.7552472023533312,52.516917630727676';
    const newUrl = `${baseUrl}/${selectedAge}?${map_qs}`;
    setMapUrl(newUrl);
  };

  useEffect(() => {
    updateMap();
  }, []);

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
            <h1 className="govuk-heading-l">Population age</h1>
            <p className="govuk-body-l">
              Explore population data by age group across local authorities and
              districts in England.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 id="map" className="govuk-heading-m govuk-!-padding-top-7">
              Map: population by age group
            </h2>
            <p className="govuk-body">
              <strong>Location:</strong> Greenfields Care, Mid Suffolk, Suffolk,
              East of England.
            </p>
            <p className="govuk-body">
              Find out how{' '}
              <a href="../help/population-age" className="govuk-link">
                percentage of population in age group
              </a>{' '}
              is defined, sourced, and updated.
            </p>

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
                    Update age group
                  </button>
                </fieldset>
              </div>
            </form>

            <div className="govuk-form-group">
              <h3 className="govuk-heading-s">[DATA VIS COMPONENT HEADING]</h3>
              {mapUrl && (
                <iframe
                  width="100%"
                  height="600px"
                  title="ONS Census Maps"
                  frameBorder="0"
                  src={mapUrl}
                ></iframe>
              )}
            </div>

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
              Data correct as of 5 February 2025
            </p>
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
              <li>
                <a href="../help/disability-prevalence" className="govuk-link">
                  Disability prevalence
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PopulationAgePage;
