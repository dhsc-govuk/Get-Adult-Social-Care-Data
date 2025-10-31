'use client';

import React, { useCallback, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import ButtonWithArrow from '../../../src/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

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
              <div id="location-hint" className="govuk-hint">
                Start typing for suggestions.
              </div>
              <select
                className="govuk-select"
                name="location_list"
                id="location_list"
              >
                <option value="">Select an option</option>
                {dummyLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="govuk-button-group">
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                onClick={setSelectedLocation(
                  'Shoggins Care Services (Brighton)'
                )}
              >
                Apply changes
              </button>
              <a href="" className="govuk-link" target="_blank">
                Cancel and go back
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LocationSelectPage;
