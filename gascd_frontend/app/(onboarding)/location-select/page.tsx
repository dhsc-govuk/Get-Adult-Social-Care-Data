'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import Link from 'next/link';
import LocationService, {
  AvailableLocation,
} from '@/services/location/locationService';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import AnalyticsService from '@/services/analytics/analyticsService';

const LocationSelectPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<
    AvailableLocation[]
  >([]);
  const [searchedLocations, setSearchedLocations] = useState<
    AvailableLocation[]
  >([]);

  useEffect(() => {
    const fetchAvailableLocations = async () => {
      const availableLocations = await LocationService.getAvailableLocations();
      setAvailableLocations(availableLocations);
      setSearchedLocations(availableLocations);
      const currentSelectedLocation =
        await LocationService.getSelectedLocation();
      const currentSelectedLocationName =
        await LocationService.getSelectedLocationDisplayName();
      if (currentSelectedLocation) {
        setSelectedLocation(currentSelectedLocation);
        setSelectedLocationName(currentSelectedLocationName);
      }
    };

    fetchAvailableLocations();
  }, []);

  const handleChange = (location: string, location_name: string) => {
    setSelectedLocation(location);
    setSelectedLocationName(location_name);
  };

  const handleSubmit = async () => {
    if (session?.user.selectedLocationId) {
      // If they had a previous location, track this change
      AnalyticsService.trackLocationChange(selectedLocation);
    }

    await LocationService.setSelectedLocation(
      selectedLocation,
      selectedLocationName
    );
    router.push('/home#top');
    // Ensure changes to saved name are displayed
    router.refresh();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = availableLocations.filter((location) =>
      location.location_name.toLowerCase().includes(searchTerm)
    );
    setSearchedLocations(filtered);
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
                {availableLocations.length > 1 && (
                  <div
                    className="search-field search-field-darker"
                    id="data-radio-buttons-search-filter"
                  >
                    <div className="search-input">
                      <label className="govuk-label" htmlFor="search-location">
                        Search for a location
                      </label>
                      <input
                        className="govuk-input"
                        id="search-location"
                        name="searchLocation"
                        type="text"
                        onKeyUp={handleSearch}
                      />
                    </div>
                  </div>
                )}

                <fieldset className="govuk-fieldset">
                  <legend className="govuk-visually-hidden">
                    Select a location from your care provider group
                  </legend>
                  {selectedLocation && (
                    <p className="govuk-heading-m">
                      You&apos;ve selected &quot;{selectedLocationName}
                      &quot;{' '}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {searchedLocations.map((location, index) => (
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
                          onChange={() =>
                            handleChange(
                              location.location_id,
                              location.location_name
                            )
                          }
                        />
                        <label
                          htmlFor={`location-${index}`}
                          className="govuk-label govuk-radios__label"
                        >
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
                {session && session.user?.selectedLocationId && (
                  <Link href="/" className="govuk-link govuk-body-m">
                    Cancel and go back
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LocationSelectPage;
