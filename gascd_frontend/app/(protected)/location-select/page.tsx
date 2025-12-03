'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import Link from 'next/link';
import LocationService, {
  AvailableLocation,
} from '@/services/location/locationService';

const LocationSelectPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<
    AvailableLocation[]
  >([]);

  useEffect(() => {
    const fetchAvailableLocations = async () => {
      const availableLocations = await LocationService.getAvailableLocations();
      const sortedLocations = availableLocations.sort((a, b) =>
        a.location_name.localeCompare(b.location_name)
      );
      setAvailableLocations(sortedLocations);

      const currentSelectedLocation = LocationService.getSelectedLocation();
      if (currentSelectedLocation) {
        setSelectedLocation(await currentSelectedLocation);
      }
    };

    fetchAvailableLocations();
  }, []);

  const handleChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleSubmit = () => {
    LocationService.setSelectedLocation(selectedLocation);
  };

  return (
    <>
      <Layout
        title="Choose a location from your care provider group"
        showLoginInformation={false}
        currentPage="location-select"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Select a location from your care provider group
            </h1>
            <p className="govuk-body">
              We use the selected location to show you:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>data about the location</li>
              <li>local and regional data based on that location</li>
            </ul>
            <p className="govuk-body">
              You can change to another location in your care provider group at
              any time.
            </p>
            <form>
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-label govuk-label--m govuk-fieldset__legend hidden">
                    Select a location from your care provider group
                  </legend>
                  <div className="govuk-radios" data-module="govuk-radios">
                    {availableLocations.map((location, index) => (
                      <div
                        className="govuk-radios__item"
                        key={`location-${index}`}
                      >
                        <input
                          id={`location-${index}`}
                          name="availableLocation"
                          className="govuk-radios__input"
                          type="radio"
                          value={location.location_id}
                          checked={selectedLocation === location.location_id}
                          onChange={() => handleChange(location.location_id)}
                        />
                        <label className="govuk-label govuk-radios__label">
                          {location.location_name}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button"
                  onClick={() => handleSubmit()}
                >
                  Apply changes
                </button>
                <Link href="/" className="govuk-link govuk-body-m">
                  Cancel and go back
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LocationSelectPage;
