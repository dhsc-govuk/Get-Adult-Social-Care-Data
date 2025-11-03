'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import PresentDemandService from '@/services/present-demand/presentDemandService';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PresentDemandLocations: React.FC = () => {
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedCPLocation, setSelectedCPLocation] = useState<string | null>(
    null
  );
  const { data: session, status } = useSession();
  const [cpLocation, setCpLocation] = useState<string>();

  useEffect(() => {
    const fetchCareProviderLocationName = async () => {
      const storedLocationId = localStorage.getItem('selectedValue');
      if (storedLocationId) {
        setCpLocation(storedLocationId);
      } else if (session) {
        if (session.user.locationType == 'Care provider') {
          const locationId = await PresentDemandService.getDefaultCPLocation(
            session.user.locationId ?? ' ',
            session.user.locationType
          );
          setCpLocation(locationId);
        } else {
          setCpLocation(session.user.locationId);
        }
      }
    };
    fetchCareProviderLocationName();
  }, [session]);

  useEffect(() => {
    const getData = async () => {
      if (cpLocation) {
        try {
          const locations =
            await PresentDemandService.getAvailableLocations(cpLocation);
          setAvailableLocations(locations);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };
    getData();
  }, [cpLocation]);

  const handleChange = (value: string) => {
    setSelectedCPLocation(value);
  };

  const handleSubmit = () => {
    if (selectedCPLocation) {
      localStorage.setItem('selectedValue', selectedCPLocation);
    } else {
      alert('Please select an option!');
    }
  };

  return (
    <>
      <Layout
        title="Edit locations"
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="present-demand-locations"
        showNavBar={false}
      >
        <a href="../present-demand" className="govuk-back-link">
          Back
        </a>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Edit locations </h1>
            <h2 className="govuk-heading-m"> Your locations</h2>
            <div className="govuk-form-group">
              <form>
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
                  {availableLocations ? (
                    <div className="govuk-radios" data-module="govuk-radios">
                      {availableLocations.map((item, index) => (
                        <div
                          className="govuk-radios__item"
                          key={item.metric_location_name}
                        >
                          <input
                            className="govuk-radios__input"
                            id={`radio-${index}`}
                            name="options"
                            type="radio"
                            value={item.metric_location_id}
                            onChange={() =>
                              handleChange(item.metric_location_id)
                            }
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`radio-${index}`}
                          >
                            {item.metric_location_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p> No other locations available </p>
                  )}
                </fieldset>
                <Link href="/present-demand" onClick={handleSubmit}>
                  <button type="button" className="govuk-button">
                    Submit
                  </button>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PresentDemandLocations;
