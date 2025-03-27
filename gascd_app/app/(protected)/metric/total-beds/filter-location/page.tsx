'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import IndicatorFetchService from '@/services/indicator/IndicatorFetchService';

const PresentDemandLocations: React.FC = () => {
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [selectedCPLocation, setSelectedCPLocation] = useState<string | null>(
    null
  );
  const { data: session, status } = useSession();
  const [cpLocation, setCpLocation] = useState<string>();

  useEffect(() => {
    if (session) {
      let locationId = session.user.locationId;
      let locationType = session.user.locationType;
      if (locationType == 'Care provider') {
        locationId = localStorage.getItem('selectedValue')!;
      }
      setCpLocation(locationId);
    }
  }, [session]);

  useEffect(() => {
    const getData = async () => {
      if (cpLocation) {
        try {
          const locations =
            await IndicatorFetchService.getLocalAuthoritiesInProviderLocationRegion(
              cpLocation
            );
          setAvailableLocations(locations);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };
    getData();
  }, [cpLocation]);

  const handleChange = (value: any) => {
    setSelectedCPLocation(value);
  };

  const handleSubmit = () => {
    if (selectedCPLocation) {
      let selected = availableLocations.find(
        (l) => l.la_code === selectedCPLocation
      );

      localStorage.setItem('IndicatorLocationSelectedCode', selected.la_code);
      localStorage.setItem('IndicatorLocationSelectedName', selected.la_name);
      localStorage.setItem(
        'IndicatorLocationSelectedRegion',
        selected.region_name
      );
    }
  };

  return (
    <>
      <title> Edit location</title>
      <Layout
        autoSpaceMainContent={false}
        showLoginInformation={true}
        currentPage="present-demand-locations"
        showNavBar={false}
      >
        <a href="/metric/total-beds" className="govuk-back-link">
          Back
        </a>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-m">
              Adult social care beds per 100,000 adult population
            </span>
            <h1 className="govuk-heading-l">Edit location</h1>
            <p className="govuk-body">
              Select the filter to refine the data displayed.
            </p>
            <h2 className="govuk-heading-m">Local authority</h2>
            <div className="govuk-form-group">
              <form>
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
                  <div className="govuk-radios" data-module="govuk-radios">
                    {availableLocations.map((item, index) => (
                      <div className="govuk-radios__item" key={item.la_code}>
                        <input
                          className="govuk-radios__input"
                          id={`radio-${index}`}
                          name="options"
                          type="radio"
                          value={item.la_code}
                          onChange={() => handleChange(item.la_code)}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`radio-${index}`}
                        >
                          {item.la_name}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                <Link href="/metric/total-beds" onClick={handleSubmit}>
                  <button type="button" className="govuk-button">
                    Apply changes
                  </button>
                </Link>
                <p className="govuk-body">
                  <Link href="/metric/total-beds" className="govuk-link">
                    Cancel and go back
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PresentDemandLocations;
