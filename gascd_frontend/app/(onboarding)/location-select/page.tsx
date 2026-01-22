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
    AvailableLocation[][]
  >([]);
  const [chunkedLocations, setChunkedLocations] = useState<
    AvailableLocation[][]
  >([]);
  const [paginationRequired, setPaginationRequired] = useState<boolean>(false);

  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    const fetchAvailableLocations = async () => {
      const availableLocations = await LocationService.getAvailableLocations();
      setAvailableLocations(availableLocations);
      let chunkedLocations = LocationService.chunkLocations(availableLocations);

      setChunkedLocations(chunkedLocations);
      setSearchedLocations(chunkedLocations);

      if (chunkedLocations.length > 1) {
        setPaginationRequired(true);
        setPageNumber(1);
        paginationPageNumbers();
      }

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
    const filtered = chunkedLocations
      .flat()
      .filter((location) =>
        location.location_name.toLowerCase().includes(searchTerm)
      );

    const chunkedFilteredLocations = LocationService.chunkLocations(filtered);

    setSearchedLocations(chunkedFilteredLocations);
    paginationPageNumbers();
  };

  const paginationPageNumbers = () => {
    const length = searchedLocations.length;

    if (length < 3) return [];
    if (length === 3) return [1, 2, 3];

    const result: (number | null)[] = [1];
    const adjacentPages = [pageNumber - 1, pageNumber, pageNumber + 1]
      .filter((page) => page > 1 && page < length)
      .sort((a, b) => a - b);

    let lastPage = 1;
    for (const page of adjacentPages) {
      if (page - lastPage > 1) result.push(null);
      result.push(page);
      lastPage = page;
    }

    if (length - lastPage > 1) result.push(null);
    result.push(length);

    return result;
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
                {availableLocations.length > 20 && (
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
                    {searchedLocations[pageNumber - 1]?.map(
                      (location, index) => (
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
                      )
                    )}
                  </div>
                </fieldset>

                {paginationRequired && (
                  <nav
                    className="govuk-pagination"
                    aria-label="Pagination"
                    data-paging
                  >
                    {pageNumber > 1 && (
                      <div className="govuk-pagination__prev pager-prev">
                        <a
                          className="govuk-link govuk-pagination__link"
                          href="#"
                          rel="prev"
                          onClick={() => setPageNumber(pageNumber - 1)}
                        >
                          <svg
                            className="govuk-pagination__icon govuk-pagination__icon--prev"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                          >
                            <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
                          </svg>
                          <span className="govuk-pagination__link-title">
                            Previous
                            <span className="govuk-visually-hidden"> page</span>
                          </span>
                        </a>
                      </div>
                    )}

                    {searchedLocations.length > 2 && (
                      <ul className="govuk-pagination__list pager-items">
                        {paginationPageNumbers().map((page, index) =>
                          page !== null ? (
                            <li
                              className={`govuk-pagination__item ${page === pageNumber ? ' govuk-pagination__item--current' : ''}`}
                              key={index}
                            >
                              <a
                                className="govuk-link govuk-pagination__link"
                                href="#"
                                aria-label={`page-${page}`}
                                onClick={() => setPageNumber(page)}
                              >
                                {page}
                              </a>
                            </li>
                          ) : (
                            <li className="govuk-pagination__item" key={index}>
                              ...
                            </li>
                          )
                        )}
                      </ul>
                    )}

                    {pageNumber < searchedLocations.length && (
                      <div className="govuk-pagination__next pager-next">
                        <a
                          className="govuk-link govuk-pagination__link"
                          href="#"
                          rel="next"
                          onClick={() => setPageNumber(pageNumber + 1)}
                        >
                          <span className="govuk-pagination__link-title">
                            Next
                            <span className="govuk-visually-hidden"> page</span>
                          </span>
                          <svg
                            className="govuk-pagination__icon govuk-pagination__icon--next"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                          >
                            <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                          </svg>
                        </a>
                      </div>
                    )}
                  </nav>
                )}
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
