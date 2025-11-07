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
              Choose a location from your care provider group
            </h1>
            <p className="govuk-body">
              We use this to display your local and regional comparison data in
              the service.
            </p>
            <p className="govuk-body">
              You can switch to another location at any time by using the
              &apos;Change&apos; link at the top of the page.
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
                    <option value="">Select an option</option>
                    {dummyLocations.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </fieldset>
                <div className="govuk-button-group">
                  <Link href="/">
                    <button
                      type="button"
                      className="govuk-button"
                      onClick={() => handleSubmit()}
                    >
                      Apply changes
                    </button>
                  </Link>
                  <p className="govuk-body">
                    <Link href="/" className="govuk-link">
                      Cancel and go back
                    </Link>
                  </p>
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
