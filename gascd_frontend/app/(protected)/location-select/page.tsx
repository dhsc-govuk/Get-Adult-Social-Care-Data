'use client';

import React, { useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import Link from 'next/link';

const LocationSelectPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const dummyLocations = [
    'Shoggins Care Services (Brighton)',
    'Shoggins Care Services (Ipswich)',
    'Shoggins Care Services (Newcastle)',
    'Shoggins Care Services (Reading)',
    'Shoggins Care Services (Shrewsbury)',
    'Shoggins Care Services (Sudbury)',
  ];

  const handleChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleSubmit = () => {
    if (selectedLocation) {
      console.log('Selected location:', selectedLocation);
    }
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
              You can change to another location in your care provider group at any time.
            </p>
            <div className="govuk-form-group">
              <form>
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
                  <div id="location-hint" className="govuk-hint">
                    Start typing for suggestions.
                  </div>
                  <select
                    className="govuk-select"
                    name="location_list"
                    id="location_list"
                    value={selectedLocation}
                    onChange={(e) =>
                      handleChange((e.target as HTMLSelectElement).value)
                    }
                  >
                    <option value="" disabled>Select an option</option>
                    {dummyLocations.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </fieldset>
                <div className="govuk-button-group" style={{ alignItems: 'center' }}>
                  <Link href="/">
                    <button
                      type="button"
                      className="govuk-button"
                      onClick={() => handleSubmit()}
                    >
                      Apply changes
                    </button>
                  </Link>
                  <Link href="/" className="govuk-link">
                    Cancel and go back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LocationSelectPage;
